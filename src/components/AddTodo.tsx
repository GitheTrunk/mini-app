import { useState, type FormEvent } from 'react'

interface AddTodoProps {
  onAdd: (text: string) => void
}

export default function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText) {
      setError(true)
      return
    }

    setError(false)
    onAdd(trimmedText)
    setText('')
  }

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <label htmlFor="new-todo">New task</label>
      <div className="input-row">
        <input
          id="new-todo"
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            setError(false)
          }}
          aria-invalid={error}
          aria-describedby={error ? 'new-todo-error' : undefined}
          placeholder="What needs doing?"
        />
        <button type="submit">Add todo</button>
      </div>
      {error && <p id="new-todo-error" role="alert" className="message error">Enter a task before adding it.</p>}
    </form>
  )
}
