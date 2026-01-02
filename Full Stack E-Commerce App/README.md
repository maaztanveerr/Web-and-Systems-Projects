# Maaz’s Market — Full-Stack E-Commerce Demo (React + Express + PostgreSQL)

Maaz’s Market is a simplified full-stack e-commerce web app that demonstrates the core shopping flow: browsing products, viewing product details, adding items to a cart, and placing a **test order** at checkout. The frontend is built in React (Vite) and the backend is an Express REST API connected to PostgreSQL.

> This project is designed as a clean “portfolio-style” full-stack example (no real payments processed).

---

## Features
- **Product catalog** page (`/products`) that loads items from the backend
- **Product detail** pages (`/products/:productId`)
- **Cart** with:
  - add-to-cart
  - remove items
  - update quantities
  - subtotal + total calculation
- **Checkout** form with basic validation (name, email, address)
- **Order submission** to the backend (order stored in PostgreSQL)
- UI components styled using **Material UI**
- Product images fall back to a local placeholder if a remote URL fails

---

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Material UI

### Backend
- Node.js
- Express
- PostgreSQL (`pg`)
- dotenv
- cors

---

## How It Works (High-Level)
- The React app fetches products from the API:
  - `GET http://localhost:3000/products`
  - `GET http://localhost:3000/products/:id`
- Cart state is managed globally using a **CartContext** provider (`CartContext.jsx`).
- Checkout submits an order payload to:
  - `POST http://localhost:3000/orders`
- The backend stores the order in Postgres (cart items stored as JSONB).

---

## API Endpoints

### Health / Base
- `GET /`
  - Returns a welcome string
- `GET /up`
  - Returns: `{ "status": "up" }`

### Products
- `GET /products`
  - Returns all products from the `products` table
- `GET /products/:id`
  - Returns a single product by id
  - Returns `404` if the product does not exist

### Orders
- `POST /orders`
  - Stores an order in Postgres (table: `orders_mat927`)

**Validations**
- Requires `customer` and `items`
- Requires `customer.name`, `customer.email`, `customer.address`
- Requires `items` to be a non-empty array

## Expected Database Schema

### **`products` table**
This project assumes your `products` table includes at least:
- **id** (int, primary key)
- **name** (text)
- **price** (numeric/decimal)
- **description** (text)
- **image_url** (text, optional)

### **`orders_mat927` table**
This project assumes your `orders_mat927` table includes at least:
- **id** (serial/int, primary key)
- **customer_name** (text)
- **email** (text)
- **address** (text)
- **items** (jsonb)

## Possible Improvements
- **Search + filter + sort** products
- Persist cart to **localStorage** (or store per user in DB)
- Add **user authentication** + **order history**
- Add **inventory** + **admin CRUD** panel
- Add **payment processing (Stripe)** for a real checkout experience

**Example request body**
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St"
  },
  "items": [
    { "id": 1, "name": "Keyboard", "price": 49.99, "quantity": 2 }
  ],
  "total": 99.98
}

Example response
{ "id": 15 }

## How to Run Locally

### Prerequisites
- **Node.js** installed
- Access to a **PostgreSQL** database (course-provided or your own)

### 1) Server Setup
Go into the **server** folder, install dependencies, and set up env vars:

```bash
npm install
cp .env.example .env
Fill in your database credentials inside .env.

Start the server:
- npm run dev

2) Client Setup

Go into the client folder and run:
- npm install
- npm run dev

Notes:

- The frontend currently calls the backend using a hardcoded URL: http://localhost:3000

- Orders are test orders only (no real payments).

- If a product image URL fails, the UI falls back to a local placeholder image.