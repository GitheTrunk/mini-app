import type { ProductFormData } from './types'

export interface ValidationErrors {
  name?: string
  price?: string
}

export function validateProductForm(data: ProductFormData): ValidationErrors {
  const errors: ValidationErrors = {}
  const name = data.name?.trim() ?? ''
  const price = data.price?.trim() ?? ''

  if (name.length === 0) {
    errors.name = 'Product name is required.'
  }

  if (price.length === 0) {
    errors.price = 'Price is required.'
  } else {
    const parsed = Number(data.price)
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      errors.price = 'Price must be a valid number.'
    } else if (parsed <= 0) {
      errors.price = 'Price must be greater than zero.'
    }
  }

  return errors
}
