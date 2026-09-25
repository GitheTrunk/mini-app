import { useContext } from 'react'
import { CartContext } from '../context/cart-context'
import CheckoutSummary from '../components/CheckoutSummary'

export default function CartPage() {
  const cart = useContext(CartContext)

  if (cart === undefined) {
    throw new Error('CartPage must be used inside CartProvider')
  }

  const { state, dispatch } = cart

  return (
    <section className="page panel">
      <div className="page-heading">
        <p className="eyebrow">Reducer state</p>
        <h1>Shopping cart</h1>
        <p>Manage cart items with useReducer.</p>
      </div>

        {state.items.length === 0 ? (
            <p className="empty-state">Your cart is empty.</p>
        ) : (
            <ul className="cart-list">
                {state.items.map((item) => (
                    <li key={item.id}>
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                        <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            aria-label={`Quantity for ${item.name}`}
                            onChange={(e) =>
                                dispatch({
                                    type: 'UPDATE_QUANTITY',
                                    id: item.id,
                                    quantity: Number(e.target.value),
                                })
                            }
                        />
                        <button
                            type="button"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() =>
                                dispatch({ type: 'REMOVE_ITEM', id: item.id })
                            }
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        )}
        <button
            type="button"
            onClick={() =>
                dispatch({
                    type: 'ADD_ITEM',
                    item: {
                        id: Date.now(),
                        name: `Item ${state.items.length + 1}`,
                        price: Math.random() * 100,
                        quantity: 1,
                    },
                })
            }
        >
            Add random item
        </button>
        <CheckoutSummary />
    </section>
  )
}
