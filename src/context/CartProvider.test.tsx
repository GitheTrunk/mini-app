import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import CartPage from '../pages/CartPage'
import { CartProvider } from './CartProvider'

describe('CartProvider', () => {
  it('restores cart items after the provider remounts', async () => {
    // Arrange
    const user = userEvent.setup()
    const view = render(<CartProvider><CartPage /></CartProvider>)

    // Act
    await user.click(screen.getByRole('button', { name: 'Add random item' }))
    expect(screen.getByText('Item 1')).toBeVisible()
    view.unmount()
    render(<CartProvider><CartPage /></CartProvider>)

    // Assert
    expect(screen.getByText('Item 1')).toBeVisible()
    expect(screen.getByText('Total items: 1')).toBeVisible()
  })

  it('starts with an empty cart when stored JSON is invalid', () => {
    // Arrange
    window.localStorage.setItem('shopping-cart', '{invalid')

    // Act
    render(<CartProvider><CartPage /></CartProvider>)

    // Assert
    expect(screen.getByText('Your cart is empty.')).toBeVisible()
  })
})
