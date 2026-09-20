import { createContext, type Dispatch } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

export type Action =
  | {
      type: 'ADD_ITEM'
      item: CartItem
    }
  | {
      type: 'REMOVE_ITEM'
      id: number
    }
  | {
      type: 'UPDATE_QUANTITY'
      id: number
      quantity: number
    }

export interface CartState {
  items: CartItem[]
}

export function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { items: [...state.items, action.item] }

    case 'REMOVE_ITEM':
      return { items: state.items.filter((item) => item.id !== action.id) }

    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== action.id) }
      }
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: action.quantity } : item,
        ),
      }

    default:
      return state
  }
}

export interface CartContextType {
  state: CartState
  dispatch: Dispatch<Action>
}

export const CartContext = createContext<CartContextType | undefined>(undefined)
