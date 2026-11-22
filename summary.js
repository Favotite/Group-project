import { formatPrice } from "./products.js";

const ORDER_STORAGE_KEY = "miniMarketLatestOrder";

export function saveOrder(order) {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch (error) {
    console.warn("Order could not be saved in this browser.", error);
  }
}

export function renderOrderSummary(order, container) {
  if (!order) {
    container.innerHTML = `<div class="empty-state"><h2>No order to show yet</h2><p>Complete checkout to see your order summary.</p></div>`;
    return;
  }

  const date = new Date(order.date);
  const safe = value => escapeHTML(value);
  container.innerHTML = `
    <div class="success-panel">
      <div class="success-icon" aria-hidden="true">✓</div>
      <p class="eyebrow">ORDER CONFIRMED</p>
      <h1>Thank you, ${safe(order.customer.name.split(" ")[0])}!</h1>
      <p class="muted">Your demo order has been placed successfully.</p>
      <p class="order-id">${safe(order.orderId)}</p>
      <p class="muted">${Number.isNaN(date.getTime()) ? "" : date.toLocaleString()}</p>

      <div class="order-details">
        <div class="detail-block">
          <h3>Customer details</h3>
          <p>${safe(order.customer.name)}<br>${safe(order.customer.email)}<br>${safe(order.customer.phone)}</p>
        </div>
        <div class="detail-block">
          <h3>Delivery address</h3>
          <p>${safe(order.customer.address)}</p>
        </div>
      </div>

      <div class="order-products">
        <h3>Order items</h3>
        ${order.items.map(item => `
          <div class="order-product">
            <span>${safe(item.title)} × ${Number(item.quantity)}</span>
            <span>${formatPrice(Number(item.price) * Number(item.quantity))}</span>
          </div>
        `).join("")}
        <div class="order-total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
      </div>
      <button class="button button-primary" type="button" data-continue-shopping>Continue shopping →</button>
    </div>
  `;
  container.querySelector("[data-continue-shopping]")?.addEventListener("click", () => {
    const event = new CustomEvent("continue-shopping");
    document.dispatchEvent(event);
  });
}

export function loadLatestOrder() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
