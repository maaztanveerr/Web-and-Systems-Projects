// this file keeps the cart state for the whole react app

import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null) // used by any component that needs the cart

export function CartProvider({ children }) {
  // cartItems is an array like [{ id, name, price, quantity }]
  const [cartItems, setCartItems] = useState([])

  // add a product to the cart or increase quantity if already there
  function addToCart(product) {
    setCartItems(prevItems => {
      // find the item if it exists
      const existingItem = prevItems.find(item => item.id === product.id)

      // if we already have the item update quantity
      if (existingItem) {
        const updatedItems = prevItems.map(item => {
          if (item.id === product.id) {
            return {
              ...item,
              quantity: item.quantity + 1
            }
          }
          return item
        })
        return updatedItems
      }

      // if we do not have it add a new entry with quantity 1
      const newItem = {
        id: product.id,
        name: product.name,
        price: Number(product.price),  // store price as a number so math is easier later
        quantity: 1
      }

      return [...prevItems, newItem]
    })
  }

  // remove an item from the cart completely
  function removeFromCart(productId) {
    setCartItems(prevItems => {
      const filtered = prevItems.filter(item => item.id !== productId)
      return filtered
    })
  }

  // change the quantity for one item
  function updateQuantity(productId, newQuantity) {
    // no <0
    if (newQuantity < 1) {
      return
    }

    setCartItems(prevItems => {
      const updated = prevItems.map(item => {
        if (item.id === productId) {
          return {
            ...item,
            quantity: newQuantity
          }
        }
        return item
      })
      return updated
    })
  }

  // clear cart after successful checkout
  function clearCart() {
    setCartItems([])
  }

  // calculate total
  let total = 0
  cartItems.forEach(item => {
    const priceNumber = Number(item.price)
    total = total + priceNumber * item.quantity
  })

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// small helper
export function useCart() {
  const ctx = useContext(CartContext)
  return ctx
}