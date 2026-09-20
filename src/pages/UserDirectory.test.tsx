import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import UserDirectory from './UserDirectory'

function renderDirectory() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { id: 1, name: 'Alice Green', username: 'alice' },
      { id: 2, name: 'Bob Brown', username: 'bob' },
    ],
  }))
  render(<MemoryRouter><UserDirectory /></MemoryRouter>)
}

describe('UserDirectory', () => {
  it('shows users after the asynchronous request and removes the loading indicator', async () => {
    // Arrange
    renderDirectory()
    expect(screen.getByRole('status', { name: 'Loading users' })).toBeVisible()

    // Act
    const alice = await screen.findByRole('link', { name: /Alice Green/ })

    // Assert
    expect(alice).toBeVisible()
    expect(screen.getByRole('link', { name: /Bob Brown/ })).toBeVisible()
    expect(screen.queryByRole('status', { name: 'Loading users' })).toBeNull()
  })

  it('keeps the raw search current while repeated typing delays the filtered result', async () => {
    // Arrange
    const user = userEvent.setup()
    renderDirectory()
    await screen.findByRole('link', { name: /Alice Green/ })

    // Act
    await user.type(screen.getByLabelText('Search users'), 'Al')
    await new Promise((resolve) => setTimeout(resolve, 300))
    await user.type(screen.getByLabelText('Search users'), 'ice')

    // Assert
    expect(screen.getByText('Raw value: Alice')).toBeVisible()
    expect(screen.getByText('Debounced value:')).toBeVisible()
    expect(screen.getByRole('link', { name: /Bob Brown/ })).toBeVisible()
    expect(await screen.findByText('Debounced value: Alice')).toBeVisible()
    expect(screen.queryByRole('link', { name: /Bob Brown/ })).toBeNull()
  })
})
