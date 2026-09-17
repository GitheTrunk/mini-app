import { useState, type FormEvent } from 'react'
import type { Product, ProductFormData } from './types'
import { initialProducts } from './data'
import { validateProductForm, type ValidationErrors } from './validation'
import './App.css'

function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showInStockOnly, setShowInStockOnly] = useState(false)

  const visibleProducts = products.filter(
    (product) => !showInStockOnly || product.inStock,
  )

  const saleCount = visibleProducts.filter((product) => product.onSale).length

  const [formData, setFormData] = useState<ProductFormData>({ name: '',
    price: '',
  })

  const [errors, setErrors] = useState<ValidationErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateProductForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const newProduct: Product = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: formData.name.trim(),
      price: Number(formData.price),
      inStock: true,
      onSale: false,
    }

    setProducts((prev) => [...prev, newProduct])
    setFormData({ name: '', price: '' })
  }

  return (
    <div className="catalog">
      <header className="catalog-header">
        <h1>Product Catalog</h1>
        <p className="product-count">{visibleProducts.length} products</p>
        {saleCount > 0 && <span className="sale-counter">{saleCount} on sale</span>}
      </header>

      <label className="filter">
        <input
          type="checkbox"
          checked={showInStockOnly}
          onChange={(event) => setShowInStockOnly(event.target.checked)}
        />
        In stock only
      </label>

      <ul className="grid">
        {visibleProducts.map((product) => (
          <li key={product.id} className="card">
            <h2>{product.name}</h2>
            <p className="price">${product.price.toFixed(2)}</p>
            {product.inStock
              ? <span className="badge in-stock">In stock</span>
              : <span className="badge sold-out">Sold out</span>}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="add-product-form" noValidate>
        <h2>Add product</h2>

        <label>
          Name
          <input
            type="text"
            value={formData.name}
            onChange={(event) =>
              setFormData({ ...formData, name: event.target.value })
            }
          />
        </label>
        {errors.name && <p className="error">{errors.name}</p>}

        <label>
          Price
          <input
            type="text"
            value={formData.price}
            onChange={(event) =>
              setFormData({ ...formData, price: event.target.value })
            }
          />
        </label>
        {errors.price && <p className="error">{errors.price}</p>}

        <button type="submit">Add product</button>
      </form>
    </div>
  )
}

export default App
