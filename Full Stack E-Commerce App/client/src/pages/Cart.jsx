// cart page shows all items in the cart and lets the user edit them

import { Link } from 'react-router'
import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useCart } from '../CartContext.jsx'

export default function Cart() {
  // get cart data and helper functions from context
  const { cartItems, removeFromCart, updateQuantity, total } = useCart()

  // if there is nothing in the cart, show a simple message
  if (!cartItems.length) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Your cart
        </Typography>
        <Typography style={{ marginBottom: '1.5rem' }}>
          You do not have any items yet.
        </Typography>
        <Link to="/products">
          <Button variant="contained">Browse products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Your cart
      </Typography>
      <Typography
        variant="body2"
        style={{ marginBottom: '1.5rem' }}
      >
        Review your items and update the quantities before checkout.
      </Typography>

      {/* list each item in the cart */}
      <Stack spacing={2}>
        {cartItems.map(item => {
          // make sure price is a number so we can do math
          const priceNumber = Number(item.price)
          const priceDisplay = priceNumber.toFixed(2)
          const subtotal = priceNumber * item.quantity
          const subtotalDisplay = subtotal.toFixed(2)

          return (
            <Card
              key={item.id}
              style={{
                textAlign: 'left'
              }}
            >
              <CardContent>
                <Typography variant="h6">
                  {item.name}
                </Typography>
                <Typography
                  variant="body2"
                  style={{ marginBottom: '0.75rem' }}
                >
                  Price: ${priceDisplay}
                </Typography>

                {/* layout row with quantity and subtotal and remove button */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <TextField
                    type="Number"
                    label="Quantity"
                    value={item.quantity}
                    onChange={event =>
                      updateQuantity(item.id, Number(event.target.value))
                    }
                    InputProps={{ inputProps: { min: 1 } }}
                    size="small"
                    style={{ maxWidth: '100px' }}
                  />

                  <Typography>
                    Subtotal: ${subtotalDisplay}
                  </Typography>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Stack>

      {/* cart total and checkout button */}
      <Card
        style={{
          marginTop: '2rem',
          textAlign: 'center'
        }}
      >
        <CardContent>
          <Typography variant="h6">
            Cart Total: ${total.toFixed(2)}
          </Typography>
          <Typography
            variant="body2"
            style={{ marginTop: '0.25rem', marginBottom: '1rem' }}
          >
            Taxes and real payments are not processed.
          </Typography>

          <Link to="/checkout">
            <Button variant="contained">
              Go to checkout.
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}