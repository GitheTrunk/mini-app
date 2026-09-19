export interface Product {
  id: string
  name: string
  price: number
  inStock: boolean
  onSale: boolean
  internalCode: string
}

export type PublicProduct = Omit<Product, 'internalCode'>

export interface ProductFormFields {
  name: string
  price: string
}

export type ProductFormData = Partial<ProductFormFields>