# Mini Marketplace

A responsive mini online store built with **HTML, CSS, and vanilla JavaScript**. It uses DummyJSON for product data and a local `products.json` fallback.

## Features

- Fetches 20 products from DummyJSON, with loading and friendly error states
- Falls back to `products.json` if the API is unavailable
- Dynamically rendered product cards with search, category filtering, and sorting
- `Cart` class with add, remove, quantity update, item count, and `reduce`-based total
- Cart persistence with `localStorage`
- Checkout form validation with inline field errors
- Demo order creation and order summary
- Latest order saved in `localStorage`
- Responsive layout for mobile and desktop

## Team members and roles

Replace these placeholders with your team's names.

| Member | Role | Main file(s) |
|---|---|---|
| Member 1: [Name] | Products | `js/products.js` |
| Member 2: [Name] | Cart | `js/cart.js` |
| Member 3: [Name] | Checkout | `js/checkout.js` |
| Member 4: [Name] | Integration and Summary | `js/main.js`, `js/summary.js` |

## Agreed data shapes

**Product**
```js
{
  id: 1,
  title: "Phone",
  price: 499,
  category: "smartphones",
  thumbnail: "url",
  stock: 20
}
```

**Cart item**
```js
{
  id: 1,
  title: "Phone",
  price: 499,
  quantity: 2
}
```

**Order**
```js
{
  orderId: "ORD-1001",
  customer: { name, email, phone, address },
  items: [...],
  total: 998,
  date: "..."
}
```

> Cart items also keep a `thumbnail` field for displaying the cart image. Product rating is used for the optional top-rated sort.

## Run locally

1. Extract the project ZIP.
2. Open the folder in VS Code.
3. Start a local server using the VS Code **Live Server** extension, or run `python -m http.server 8000` from the project folder.
4. Visit `http://localhost:8000`.

Because this project uses JavaScript ES modules and `fetch()` for `products.json`, do **not** open `index.html` directly with a `file://` URL. Use a local server.

No npm install, build step, framework, or JavaScript library is required.

## Storage

- `miniMarketCart`: current cart items
- `miniMarketLatestOrder`: latest completed demo order

Both are stored in the browser's `localStorage`.

## Currency and checkout note

DummyJSON product prices are displayed as USD. Checkout is a front-end demonstration only: it does not collect payment or send orders to a backend.

## Git collaboration

Each member should work on their own feature branch and make commits under their own Git identity. Suggested branches:

- `feature/products`
- `feature/cart`
- `feature/checkout`
- `feature/integration-summary`

Merge each feature through a pull request after reviewing it with the team.

## Screenshots and demo

Add your actual app screenshots to the `screenshots/` folder before submission. Add your live demo/video link here:

- Demo video: [Add link]
- GitHub repository: [Add link]
