// App.jsx
import './App.css'
import { Link } from 'react-router'
import { Button } from '@mui/material'
import marketImage from './assets/market-bg.png' // your market picture

export default function App() {
  // home / landing page
  return (
    <div className="landing-hero">
      <img
        src={marketImage}
        alt="Market Picture"
        className="landing-hero-image"
      />

      {/* bottom: text box under the image */}
      <div className="landing-hero-inner">
        <h2>Welcome to Maaz&apos;s Market</h2>
        <p>
          Browse our catalog, add a few gadgets to your cart, and place a test
          order to try out the full stack shop.
        </p>

        <Link to="/products">
          <Button variant="contained">Browse Products</Button>
        </Link>
      </div>
    </div>
  )
}