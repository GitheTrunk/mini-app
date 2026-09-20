import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AddTodo from './AddTodo'

describe('AddTodo', () => {
  it('renders a labeled form and submits a trimmed task', async () => {
    // Arrange
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<AddTodo onAdd={onAdd} />)

    // Act
    await user.type(screen.getByLabelText('New task'), '  Buy milk  ')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))

    // Assert
    expect(onAdd).toHaveBeenCalledWith('Buy milk')
    expect(screen.getByLabelText('New task')).toHaveValue('')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows validation for empty input and does not submit', async () => {
    // Arrange
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<AddTodo onAdd={onAdd} />)

    // Act
    await user.click(screen.getByRole('button', { name: 'Add todo' }))

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a task before adding it.')
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('rejects whitespace input and hides the error when the user corrects it', async () => {
    // Arrange
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<AddTodo onAdd={onAdd} />)

    // Act
    await user.type(screen.getByLabelText('New task'), '   ')
    await user.click(screen.getByRole('button', { name: 'Add todo' }))
    expect(screen.getByRole('alert')).toBeVisible()
    await user.type(screen.getByLabelText('New task'), 'Call Sam')

    // Assert
    expect(screen.queryByRole('alert')).toBeNull()
    expect(onAdd).not.toHaveBeenCalled()
  })
})
