import type { Todo } from '../types/todo'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty-state">No tasks in this view.</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id}>
          <label className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
            />
            <span>{todo.text}</span>
          </label>
          <button
            type="button"
            className="secondary-button"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete ${todo.text}`}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
