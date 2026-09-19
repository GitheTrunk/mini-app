import type { TodoFilter } from '../types/todo'

interface FilterBarProps {
  filter: TodoFilter
  remainingCount: number
  completedCount: number
  onFilterChange: (filter: TodoFilter) => void
  onClearCompleted: () => void
}

const filters: TodoFilter[] = ['all', 'active', 'completed']

export default function FilterBar({
  filter,
  remainingCount,
  completedCount,
  onFilterChange,
  onClearCompleted,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <span>{remainingCount} left</span>
      <div className="filter-options" aria-label="Filter todos">
        {filters.map((option) => (
          <button
            key={option}
            type="button"
            className={filter === option ? 'filter-button selected' : 'filter-button'}
            aria-pressed={filter === option}
            onClick={() => onFilterChange(option)}
          >
            {option[0].toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="secondary-button"
        onClick={onClearCompleted}
        disabled={completedCount === 0}
      >
        Clear completed
      </button>
    </div>
  )
}
