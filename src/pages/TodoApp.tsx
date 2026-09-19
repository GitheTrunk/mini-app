import { useState } from 'react'
import AddTodo from '../components/AddTodo'
import FilterBar from '../components/FilterBar'
import TodoList from '../components/TodoList'
import type { Todo, TodoFilter } from '../types/todo'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<TodoFilter>('all')

  function addTodo(text: string) {
    setTodos((current) => [
      ...current,
      { id: crypto.randomUUID(), text, completed: false },
    ])
  }

  function toggleTodo(id: string) {
    setTodos((current) => current.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    ))
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed))
  }

  const visibleTodos = todos.filter((todo) =>
    filter === 'all' || (filter === 'active' ? !todo.completed : todo.completed),
  )
  const remainingCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - remainingCount

  return (
    <section className="page panel">
      <div className="page-heading">
        <p className="eyebrow">Lifted state</p>
        <h1>Todos</h1>
        <p>Add tasks, mark them done, and choose what to see.</p>
      </div>
      <AddTodo onAdd={addTodo} />
      <FilterBar
        filter={filter}
        remainingCount={remainingCount}
        completedCount={completedCount}
        onFilterChange={setFilter}
        onClearCompleted={clearCompleted}
      />
      <TodoList todos={visibleTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </section>
  )
}
