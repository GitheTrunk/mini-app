import type { Product } from './types'

export const initialProducts: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', price: 24.99, inStock: true, onSale: true, internalCode: 'WM-001' },
  { id: 'p2', name: 'Mechanical Keyboard', price: 89.99, inStock: true, onSale: false, internalCode: 'MK-001' },
  { id: 'p3', name: 'USB-C Hub', price: 34.5, inStock: false, onSale: true, internalCode: 'UH-001' },
  { id: 'p4', name: '4K Monitor', price: 329.0, inStock: true, onSale: false, internalCode: '4K-001' },
  { id: 'p5', name: 'Webcam', price: 59.99, inStock: false, onSale: false, internalCode: 'WC-001' },
  { id: 'p6', name: 'Desk Lamp', price: 19.99, inStock: true, onSale: true, internalCode: 'DL-001' },
]
