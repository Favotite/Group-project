const CART_STORAGE_KEY = "miniMarketCart";

export class Cart {
  #items = [];

  constructor(items = []) {
    this.#items = Array.isArray(items)
      ? items.filter(item => item && Number.isFinite(Number(item.id)) && Number(item.quantity) > 0)
          .map(item => ({
            id: Number(item.id),
            title: String(item.title ?? "Product"),
            price: Number(item.price) || 0,
            quantity: Math.max(1, Math.floor(Number(item.quantity))),
            thumbnail: String(item.thumbnail ?? "")
          }))
      : [];
  }

  addItem(product) {
    if (!product || !Number.isFinite(Number(product.id))) return;
    const id = Number(product.id);
    const existing = this.#items.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.#items.push({
        id,
        title: String(product.title ?? "Product"),
        price: Number(product.price) || 0,
        quantity: 1,
        thumbnail: String(product.thumbnail ?? "")
      });
    }
  }

  removeItem(id) {
    this.#items = this.#items.filter(item => item.id !== Number(id));
  }

  updateQuantity(id, quantity) {
    const item = this.#items.find(entry => entry.id === Number(id));
    if (!item) return;
    const nextQuantity = Math.floor(Number(quantity));
    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      this.removeItem(id);
      return;
    }
    item.quantity = nextQuantity;
  }

  getItems() {
    return this.#items.map(item => ({ ...item }));
  }

  getTotal() {
    return this.#items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getItemCount() {
    return this.#items.reduce((count, item) => count + item.quantity, 0);
  }

  clear() {
    this.#items = [];
  }

  save() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.#items));
    } catch (error) {
      console.warn("Cart could not be saved in this browser.", error);
    }
  }

  static load() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
      return new Cart(saved);
    } catch {
      return new Cart();
    }
  }
}
