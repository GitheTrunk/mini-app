import { useReducer, type ReactNode } from 'react'
import { CartContext, cartReducer, type CartState } from './cart-context'

interface CartProviderProps {
  children: ReactNode
}

const initialState: CartState = {
  items: [],
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}
