import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router'
import './index.css'
import App from './App.jsx'
import Products from './pages/Products.jsx'
import Product from './pages/Product.jsx'

import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Layout from './pages/Layout.jsx'
import { CartProvider } from './CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* cartprovider keeps cart state for the whole app */}
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* layout has the nav and wraps all routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="products">
              <Route index element={<Products />} />
              {/* detail page like /products/3 */}
              <Route path=":productId" element={<Product />} />
            </Route>
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
)
