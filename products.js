const API_URL = "https://dummyjson.com/products?limit=20";
const LOCAL_URL = "./products.json";

export async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Product service returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.products)) throw new Error("Unexpected product data");
    return data.products.map(normalizeProduct);
  } catch (apiError) {
    try {
      const fallbackResponse = await fetch(LOCAL_URL);
      if (!fallbackResponse.ok) throw new Error("Local product copy could not be loaded");
      const fallbackData = await fallbackResponse.json();
      const products = Array.isArray(fallbackData) ? fallbackData : fallbackData.products;
      if (!Array.isArray(products)) throw new Error("Local product data is invalid");
      return products.map(normalizeProduct);
    } catch (fallbackError) {
      throw new Error("We couldn't load products. Check your connection and try again.");
    }
  }
}

function normalizeProduct(product) {
  return {
    id: Number(product.id),
    title: String(product.title ?? "Untitled product"),
    price: Number(product.price) || 0,
    category: String(product.category ?? "uncategorized"),
    thumbnail: String(product.thumbnail ?? product.image ?? ""),
    stock: Number(product.stock) || 0,
    rating: Number(product.rating) || 0
  };
}

export async function fetchCategories(products = []) {
  try {
    const response = await fetch("https://dummyjson.com/products/category-list");
    if (!response.ok) throw new Error("Could not load categories");
    const categories = await response.json();
    if (Array.isArray(categories)) return categories;
  } catch {
    // Categories can be derived from the locally available product list.
  }
  return [...new Set(products.map(product => product.category))].sort();
}

export function renderProducts(products, container, onAdd) {
  container.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${escapeHTML(product.thumbnail)}"
          alt="${escapeHTML(product.title)}" loading="lazy"
          onerror="this.style.display='none'">
      </div>
      <div class="product-info">
        <span class="product-category">${escapeHTML(product.category.replaceAll("-", " "))}</span>
        <h3 class="product-title">${escapeHTML(product.title)}</h3>
        <div class="product-rating">${product.rating ? `★ ${product.rating.toFixed(1)} / 5` : "Everyday pick"}</div>
        <div class="product-bottom">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="button button-primary button-small" type="button" data-add="${product.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join("");

  container.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => {
      const product = products.find(item => item.id === Number(button.dataset.add));
      if (product) onAdd(product);
    });
  });
}

export function formatPrice(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "USD", maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
