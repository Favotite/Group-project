import { Cart } from "./cart.js";
import { fetchProducts, fetchCategories, renderProducts, formatPrice } from "./products.js";
import { setupCheckout } from "./checkout.js";
import { saveOrder, renderOrderSummary } from "./summary.js";

const cart = Cart.load();
let allProducts = [];

const elements = {
  productsView: document.getElementById("products-view"),
  cartView: document.getElementById("cart-view"),
  checkoutView: document.getElementById("checkout-view"),
  summaryView: document.getElementById("summary-view"),
  productGrid: document.getElementById("product-grid"),
  productStatus: document.getElementById("products-status"),
  productCount: document.getElementById("product-count"),
  search: document.getElementById("search-input"),
  category: document.getElementById("category-filter"),
  sort: document.getElementById("sort-filter"),
  cartItems: document.getElementById("cart-items"),
  cartTotals: document.getElementById("cart-totals"),
  checkoutTotals: document.getElementById("checkout-totals"),
  orderSummary: document.getElementById("order-summary"),
  checkoutForm: document.getElementById("checkout-form"),
  badge: document.getElementById("cart-badge"),
  mobileBadge: document.getElementById("mobile-cart-badge"),
  toast: document.getElementById("toast")
};

let toastTimer;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function navigate(view) {
  const views = {
    products: elements.productsView,
    cart: elements.cartView,
    checkout: elements.checkoutView,
    summary: elements.summaryView
  };
  Object.entries(views).forEach(([key, section]) => section.classList.toggle("hidden", key !== view));
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.view === (view === "checkout" ? "cart" : view));
  });
  if (view === "cart") renderCart();
  if (view === "checkout") renderCheckoutTotals();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateBadges() {
  const count = cart.getItemCount();
  elements.badge.textContent = count;
  elements.mobileBadge.textContent = count;
}

function persistCart() {
  cart.save();
  updateBadges();
}

function getFilteredProducts() {
  const query = elements.search.value.trim().toLowerCase();
  const category = elements.category.value;
  let filtered = allProducts.filter(product =>
    product.title.toLowerCase().includes(query) &&
    (!category || product.category === category)
  );

  switch (elements.sort.value) {
    case "price-asc": filtered = [...filtered].sort((a, b) => a.price - b.price); break;
    case "price-desc": filtered = [...filtered].sort((a, b) => b.price - a.price); break;
    case "rating-desc": filtered = [...filtered].sort((a, b) => b.rating - a.rating); break;
  }
  return filtered;
}

function updateProductList() {
  const filtered = getFilteredProducts();
  elements.productCount.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"}`;
  if (!filtered.length) {
    elements.productGrid.innerHTML = "";
    elements.productStatus.textContent = "No products match your search. Try another term or category.";
    elements.productStatus.classList.remove("hidden");
    return;
  }
  elements.productStatus.classList.add("hidden");
  renderProducts(filtered, elements.productGrid, product => {
    cart.addItem(product);
    persistCart();
    showToast(`${product.title} added to cart`);
  });
}

function renderCart() {
  const items = cart.getItems();
  if (!items.length) {
    elements.cartItems.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛍️</div>
        <h2>Your cart is empty</h2>
        <p>Find something you like and add it to your cart.</p>
        <button class="button button-primary" type="button" data-shop-now>Browse products</button>
      </div>`;
    elements.cartItems.querySelector("[data-shop-now]").addEventListener("click", () => navigate("products"));
  } else {
    elements.cartItems.innerHTML = items.map(item => `
      <article class="cart-row">
        <img class="cart-thumb" src="${escapeHTML(item.thumbnail)}" alt="${escapeHTML(item.title)}"
          onerror="this.style.visibility='hidden'">
        <div>
          <h3 class="cart-item-title">${escapeHTML(item.title)}</h3>
          <span class="cart-item-price">${formatPrice(item.price)} each</span>
          <div class="cart-controls">
            <button class="qty-button" type="button" data-decrease="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-button" type="button" data-increase="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="cart-line-total">
          ${formatPrice(item.price * item.quantity)}
          <button class="button button-danger button-small" type="button" data-remove="${item.id}">Remove</button>
        </div>
      </article>
    `).join("");

    elements.cartItems.querySelectorAll("[data-increase]").forEach(button => button.addEventListener("click", () => {
      const item = cart.getItems().find(entry => entry.id === Number(button.dataset.increase));
      if (item) cart.updateQuantity(item.id, item.quantity + 1);
      persistCart(); renderCart();
    }));
    elements.cartItems.querySelectorAll("[data-decrease]").forEach(button => button.addEventListener("click", () => {
      const item = cart.getItems().find(entry => entry.id === Number(button.dataset.decrease));
      if (item) cart.updateQuantity(item.id, item.quantity - 1);
      persistCart(); renderCart();
    }));
    elements.cartItems.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
      cart.removeItem(button.dataset.remove);
      persistCart(); renderCart();
      showToast("Item removed from cart");
    }));
  }

  elements.cartTotals.innerHTML = `
    <h2>Cart summary</h2>
    <div class="summary-line"><span>Items</span><strong>${cart.getItemCount()}</strong></div>
    <div class="summary-line"><span>Subtotal</span><strong>${formatPrice(cart.getTotal())}</strong></div>
    <div class="summary-line"><span>Delivery</span><strong>Free</strong></div>
    <div class="summary-line summary-total"><span>Total</span><strong>${formatPrice(cart.getTotal())}</strong></div>
    <button class="button button-primary" type="button" id="go-checkout" ${items.length ? "" : "disabled"}>Proceed to checkout →</button>
    <button class="button button-quiet" type="button" id="keep-shopping">Continue shopping</button>
  `;
  document.getElementById("go-checkout").addEventListener("click", () => navigate("checkout"));
  document.getElementById("keep-shopping").addEventListener("click", () => navigate("products"));
}

function renderCheckoutTotals() {
  const items = cart.getItems();
  elements.checkoutTotals.innerHTML = `
    <h2>Order summary</h2>
    ${items.map(item => `<div class="summary-line"><span>${escapeHTML(item.title)} × ${item.quantity}</span><strong>${formatPrice(item.price * item.quantity)}</strong></div>`).join("")}
    <div class="summary-line"><span>Delivery</span><strong>Free</strong></div>
    <div class="summary-line summary-total"><span>Total</span><strong>${formatPrice(cart.getTotal())}</strong></div>
  `;
}

function handleOrder(order) {
  saveOrder(order);
  renderOrderSummary(order, elements.orderSummary);
  cart.clear();
  persistCart();
  navigate("summary");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    navigate(button.dataset.view);
  });
});
elements.search.addEventListener("input", updateProductList);
elements.category.addEventListener("change", updateProductList);
elements.sort.addEventListener("change", updateProductList);

setupCheckout(elements.checkoutForm, {
  getCart: () => cart,
  onOrder: handleOrder
});

document.addEventListener("continue-shopping", () => {
  cart.clear();
  persistCart();
  navigate("products");
});

async function initialize() {
  updateBadges();
  elements.productStatus.textContent = "Loading products…";
  try {
    allProducts = await fetchProducts();
    const categories = await fetchCategories(allProducts);
    elements.category.innerHTML = `<option value="">All categories</option>` +
      categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category.replaceAll("-", " "))}</option>`).join("");
    updateProductList();
  } catch (error) {
    elements.productStatus.textContent = error.message || "Something went wrong while loading products.";
    elements.productStatus.classList.add("error");
  }
}
initialize();
