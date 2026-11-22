export function setupCheckout(form, { getCart, onOrder }) {
  const fields = {
    name: form.elements.name,
    email: form.elements.email,
    phone: form.elements.phone,
    address: form.elements.address
  };

  const validators = {
    name: value => value.trim().length >= 2 || "Please enter your full name (at least 2 characters).",
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) || "Enter a valid email address.",
    phone: value => /^\d{10,15}$/.test(value.trim()) || "Enter 10–15 digits, numbers only.",
    address: value => value.trim().length >= 8 || "Please enter a complete delivery address."
  };

  function showError(key, message) {
    const field = fields[key];
    const wrapper = field.closest(".field");
    wrapper.classList.toggle("invalid", Boolean(message));
    document.getElementById(`${key}-error`).textContent = message || "";
    field.setAttribute("aria-invalid", String(Boolean(message)));
  }

  function validate() {
    let valid = true;
    const values = {};
    for (const [key, field] of Object.entries(fields)) {
      const value = field.value;
      const result = validators[key](value);
      const message = result === true ? "" : result;
      showError(key, message);
      if (message) valid = false;
      values[key] = value.trim();
    }
    return { valid, values };
  }

  Object.entries(fields).forEach(([key, field]) => {
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("invalid")) {
        const result = validators[key](field.value);
        showError(key, result === true ? "" : result);
      }
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const cart = getCart();
    if (!cart || cart.getItemCount() === 0) {
      alert("Your cart is empty. Add a product before checking out.");
      return;
    }

    const { valid, values } = validate();
    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    const order = {
      orderId: `ORD-${Date.now().toString().slice(-8)}`,
      customer: {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address
      },
      items: cart.getItems(),
      total: cart.getTotal(),
      date: new Date().toISOString()
    };
    onOrder(order);
    form.reset();
    Object.keys(fields).forEach(key => showError(key, ""));
  });
}
