import { useContext } from 'react'
import { CartContext } from '../context/cart-context'

export default function CheckoutSummary() {
  const cart = useContext(CartContext)

  if (cart === undefined) {
    throw new Error('CheckoutSummary must be used inside CartProvider')
  }

  const { state } = cart

  const totalItems = state.items.reduce((total, item) => total + item.quantity,0,)
  const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity,0,)

  return (
    <div>
      <h2>Checkout summary</h2>
        <p>Total items: {totalItems}</p>
        <p>Total price: ${totalPrice.toFixed(2)}</p>
    </div>
  )
}