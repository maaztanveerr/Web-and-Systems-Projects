import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { useCart } from '../CartContext.jsx'
import fallbackImg from '../assets/comingsoon.jpeg' // local backup image

export default function Product() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()

  // load one product based on the id in the url
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(
          `http://localhost:3000/products/${productId}`
        )
        if (!response.ok) {
          setError('Could not load product.')
          setLoading(false)
          return
        }

        const data = await response.json()
        setProduct(data)
        setLoading(false)
      } catch (err) {
        console.log(err)
        setError('Could not load product.')
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return <p>Loading product...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!product) {
    return <p>Product not found.</p>
  }

  // format price for display
  const priceNumber = Number(product.price)
  const displayPrice = priceNumber.toFixed(2)

  // start with db image, fall back to local if missing
  let imageSrc = product.image_url
  if (!imageSrc) {
    imageSrc = fallbackImg
  }

  return (
    <Card>
      <CardContent style={{ textAlign: 'center' }}>
        <Typography variant="h5">{product.name}</Typography>
        <Typography>${displayPrice}</Typography>
        <Typography style={{ marginTop: '1rem' }}>
          {product.description}
        </Typography>

        <div style={{ marginTop: '1rem' }}>
          <img
            src={imageSrc}
            alt={product.name}
            className="product-card-image"
            onError={event => {
              // switch to local backup image if the remote one fails
              event.target.onerror = null
              event.target.src = fallbackImg
            }}
          />
        </div>

        <Stack style={{ marginTop: '1rem' }}>
          <Button
            variant="contained"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}