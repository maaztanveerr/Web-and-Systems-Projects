import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useCart } from '../CartContext.jsx'

export default function Checkout() {
  const { cartItems, total, clearCart } = useCart()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [orderId, setOrderId] = useState(null)
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setOrderId(null)

    // basic validation for required fields
    if (!name || !email || !address) {
      setError('Please fill in all fields')
      return
    }

    if (email.indexOf('@') === -1) {
      setError('Please enter a valid email')
      return
    }

    if (!cartItems.length) {
      setError('Your cart is empty')
      return
    }

    // build payload for the order
    const orderPayload = {
      customer: {
        name,
        email,
        address
      },
      items: cartItems,
      total
    }

    fetch('http://localhost:3000/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    })
      .then(response => {
        if (!response.ok) {
          setError('There was a problem placing your order')
          return null
        }
        return response.json()
      })
      .then(data => {
        if (!data) {
          return
        }

        // clear cart and form, then show confirmation message
        clearCart()
        setName('')
        setEmail('')
        setAddress('')
        setOrderId(data.id)
        setSuccess('Order placed successfully!')
      })
      .catch(err => {
        console.log(err)
        setError('There was a problem placing your order')
      })
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          checkout
        </Typography>
        <Typography
          variant="body2"
          style={{ marginBottom: '1rem' }}
        >
          total amount: ${total.toFixed(2)}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack
            spacing={2}
            style={{ maxWidth: 400, marginInline: 'auto' }}
          >
            <TextField
              label="Name"
              value={name}
              onChange={event => setName(event.target.value)}
            />
            <TextField
              label="Email"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
            <TextField
              label="Address"
              multiline
              minRows={2}
              value={address}
              onChange={event => setAddress(event.target.value)}
            />

            {error && (
              <Typography color="error">
                {error}
              </Typography>
            )}

            {success && (
              <div>
                <Typography color="primary">
                  {success}
                </Typography>
                {orderId && (
                  <Typography variant="body2">
                    Your order id is {orderId}
                  </Typography>
                )}
              </div>
            )}

            <Button type="submit" variant="contained">
              Place order
            </Button>

            {success && (
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Back to home
              </Button>
            )}
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}