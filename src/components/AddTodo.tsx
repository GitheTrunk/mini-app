import { useState, type FormEvent } from 'react'

interface AddTodoProps {
  onAdd: (text: string) => void
}

export default function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText) return

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
          onChange={(event) => setText(event.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add todo</button>
      </div>
    </form>
  )
}
