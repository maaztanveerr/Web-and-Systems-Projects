// this layout wraps all pages and shows a simple nav bar

import { Link, Outlet } from 'react-router'
import { Button, Stack } from '@mui/material'
import { useCart } from '../CartContext.jsx'

export default function Layout() {
  const { cartItems } = useCart()

  // count how many items are in the cart meaning sum of quantities
  let count = 0
  cartItems.forEach(item => {
    count = count + item.quantity
  })

  return (
    <div>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Maaz's Market</h1>

        {/* nav buttons for main pages */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Link to="/">
            <Button variant="outlined">Home</Button>
          </Link>
          <Link to="/products">
            <Button variant="outlined">Products</Button>
          </Link>
          <Link to="/cart">
            <Button variant="outlined">Cart ({count})</Button>
          </Link>
        </Stack>
      </header>

      <main>
        {/* outlet shows the child route (home, products, etc) */}
        <Outlet />
      </main>
    </div>
  )
}