import { useEffect, useReducer, type ReactNode } from 'react'
import { CartContext, cartReducer, type CartState } from './cart-context'
import useLocalStorage from '../hooks/useLocalStorage'

interface CartProviderProps {
  children: ReactNode
}

const initialState: CartState = {
  items: [],
}

export function CartProvider({ children }: CartProviderProps) {
  const [savedState, setSavedState] = useLocalStorage<CartState>('shopping-cart', initialState)
  const [state, dispatch] = useReducer(cartReducer, savedState)

  useEffect(() => {
    setSavedState(state)
  }, [state, setSavedState])

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}
