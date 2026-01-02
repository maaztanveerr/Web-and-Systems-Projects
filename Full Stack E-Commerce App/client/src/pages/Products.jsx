// typography, stack

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { useCart } from '../CartContext.jsx'
import fallbackImg from '../assets/comingsoon.jpeg' // local backup image

export default function Products() {
  // state for all products from the api
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()

  // load products from the express api when the page first renders
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:3000/products')
        if (!response.ok) {
          setError('Could not load products.')
          setLoading(false)
          return
        }

        const data = await response.json()
        setProducts(data)
        setLoading(false)
      } catch (err) {
        console.log(err)
        setError('Could not load products.')
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return <p>Loading products...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Products
      </Typography>
      <Typography
        variant="body2"
        style={{ marginBottom: '1.5rem' }}
      >
        Choose a product to see more details or add it directly to your cart.
      </Typography>

      {/* show each product in a card */}
      <Stack spacing={2}>
        {products.map(product => {
          // choose image from db or our local fallback image
          let imageSrc = product.image_url
          if (!imageSrc) {
            imageSrc = fallbackImg
          }

          // format price to two decimals so the ui looks consistent
          const priceNumber = Number(product.price)
          const displayPrice = priceNumber.toFixed(2)

          return (
            <Card
              key={product.id}
              style={{
                textAlign: 'center'
              }}
            >
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography>${displayPrice}</Typography>
                <Typography style={{ marginTop: '0.5rem' }}>
                  {product.description}
                </Typography>

                <div style={{ marginTop: '1rem' }}>
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="product-card-image"
                    onError={event => {
                      // if the remote url fails (404, etc), fall back to the local image
                      event.target.onerror = null // prevent an infinite loop
                      event.target.src = fallbackImg
                    }}
                  />
                </div>

                {/* actions for this product */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  style={{ marginTop: '1rem' }}
                >
                  <Link to={`/products/${product.id}`}>
                    <Button variant="contained">View Details</Button>
                  </Link>
                  <Button
                    variant="outlined"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </div>
  )
}