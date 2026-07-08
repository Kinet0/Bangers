# Aura Wear E-Commerce Web Application

A premium, production-ready, minimalist clothing web store built with Vite + React on the frontend, and Node.js + Express on the backend. This project incorporates direct-to-consumer catalogs, cart checkout routines, dynamic promo coupons verification, and a responsive administration metrics panel.

---

## Technical Stack
* **Frontend**: Vite, React, Lucide Icons, and Vanilla CSS with custom HSL dark mode styling rules.
* **Backend**: Node.js, Express API, CORS middleware, and dotenv configurations.
* **Database**: Supabase client integration (PostgreSQL table schemas supplied in `backend/schema.sql`).
* **Payments**: Stripe Payment Intent and Webhook fulfillment systems.

*Note: If Stripe or Supabase keys are not supplied in `.env`, the project automatically runs in a local in-memory simulated database/payment gateway mode, allowing full testing of all frontend and backend flows without setting up cloud accounts.*

---

## Project Structure
```text
/clothing-store
│
├── /backend
│   ├── /config          # Database (Supabase) and Stripe clients
│   ├── /controllers     # Business logic controllers
│   ├── /middleware      # Authorization checks (requireAuth, requireRole)
│   ├── /routes          # Endpoint routes (auth, products, orders, checkout)
│   ├── app.js           # Server runner configuration
│   ├── schema.sql       # Database creation schema
│   └── package.json     # Node script configuration
│
└── /frontend
    ├── /public          # Web asset icons
    ├── /src
    │   ├── /components  # Reusable layouts (Navbar, Footer)
    │   ├── /context     # React context states (AuthContext, CartContext)
    │   ├── /pages       # All store pages (Shop, Checkout, Dashboard, Admin)
    │   ├── App.jsx      # Navigation routers mapping
    │   ├── index.css    # Typography and styling variables
    │   └── main.jsx     # Frontend entrance script
    └── package.json
```

---

## Installation & Configuration

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Configure the Backend Environment
1. Navigate to `/backend`.
2. Duplicate `.env.example` and name the file `.env`:
   ```bash
   cp .env.example .env
   ```
3. (Optional) Insert your Supabase and Stripe keys to connect live database tables and payment systems. If left as default, simulation fallback mode runs automatically.

### 2. Run the Backend API Server
In a new terminal window inside the `/backend` folder, run:
```bash
npm install
npm run dev
```
The backend server starts on `http://localhost:5000`.

### 3. Run the Frontend client
In a second terminal window inside the `/frontend` folder, run:
```bash
npm install --legacy-peer-deps
npm run dev
```
Vite will compile and serve the frontend at `http://localhost:5173`.

---

## Local Verification & Simulation Credentials

Use the following details to login and test user levels in local simulation mode:

### 1. Test Accounts
* **Staff Administrator**:
  * Email: `admin@aurawear.com`
  * Password: *(Any password)*
  * Access rights: Full access to Sales Reports, Inventory tables, Product Forms, Order Statuses, and Coupon configurations.
* **Standard Customer**:
  * Email: `customer@aurawear.com`
  * Password: *(Any password)*
  * Access rights: Cart Checkouts, Order tracking dashboard, Address editing.

### 2. Sandbox Coupons
Input these promo codes at the cart summary card to test coupon discounts:
* `WELCOME10`: 10% off cart subtotal
* `SAVE15`: 15% off cart subtotal
* `TAKE20`: Flat $20 off bill total

### 3. Payment Checkout Simulation
In checkout simulation mode, you can type any card number, expiry, and CVV value (e.g. Card: `4242 4242 4242 4242`, Exp: `12/28`, CVV: `123`). 

Clicking **Place Secure Order** simulates the background transaction validation webhook and completes fulfillment routines automatically.
