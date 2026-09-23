import { useEffect, useState, type FormEvent } from 'react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { Habit } from '../types/habit'

const habitColumns = 'id, user_id, name, completed, created_at'

export default function HabitTracker() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadHabits() {
      if (!user) {
        return
      }

      setLoading(true)
      setLoadError('')

      const { data, error } = await supabase
        .from('habits')
        .select(habitColumns)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (ignore) {
        return
      }

      if (error) {
        setLoadError(error.message)
        setHabits([])
      } else {
        setHabits((data ?? []) as Habit[])
      }

      setLoading(false)
    }

    void loadHabits()

    return () => {
      ignore = true
    }
  }, [user])

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('Enter a habit name.')
      return
    }

    if (!user) {
      setFormError('You must be signed in to add a habit.')
      return
    }

    setAdding(true)
    setFormError('')

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: trimmedName,
        completed: false,
      })
      .select(habitColumns)
      .single()

    if (error) {
      setFormError(error.message)
    } else {
      setHabits((current) => [...current, data as Habit])
      setName('')
    }

    setAdding(false)
  }

  function beginEditing(habit: Habit) {
    setEditingId(habit.id)
    setEditingName(habit.name)
    setActionError('')
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>, habit: Habit) {
    event.preventDefault()

    const trimmedName = editingName.trim()
    if (!trimmedName) {
      setActionError('Enter a habit name.')
      return
    }

    if (!user) {
      return
    }

    setActiveHabitId(habit.id)
    setActionError('')

    try {
      const query = supabase
        .from('habits')
        .update({ name: trimmedName })
        .eq('user_id', user.id)
        .eq('id', habit.id) // This line is added to target the specific habit by its ID

      const { data, error } = await query
        .select(habitColumns)
        .single()

      if (error) {
        throw error
      }

      setHabits((current) => current.map((item) => item.id === habit.id ? data as Habit : item))
      setEditingId(null)
      setEditingName('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update this habit.')
    } finally {
      setActiveHabitId(null)
    }
  }

  async function handleToggle(habit: Habit) {
    if (!user) {
      return
    }

    setActiveHabitId(habit.id)
    setActionError('')

    try {
      const query = supabase
        .from('habits')
        .update({ completed: !habit.completed })
        .eq('user_id', user.id)
        .eq('id', habit.id)

      const { data, error } = await query
        .select(habitColumns)
        .single()

      if (error) {
        throw error
      }

      setHabits((current) => current.map((item) => item.id === habit.id ? data as Habit : item))
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update this habit.')
    } finally {
      setActiveHabitId(null)
    }
  }

  async function handleDelete(habit: Habit) {
    if (!user) {
      return
    }

    setActiveHabitId(habit.id)
    setActionError('')

    try {
      const query = supabase
        .from('habits')
        .delete()
        .eq('user_id', user.id)
        .eq('id', habit.id)

      const { error } = await query

      if (error) {
        throw error
      }

      setHabits((current) => current.filter((item) => item.id !== habit.id))
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete this habit.')
    } finally {
      setActiveHabitId(null)
    }
  }

  return (
    <section className="page panel">
      <div className="page-heading">
        <p className="eyebrow">Daily progress</p>
        <h1>Habit tracker</h1>
        <p>Build consistency one habit at a time.</p>
      </div>

      <form className="habit-form" onSubmit={handleAdd}>
        <label htmlFor="habit-name">New habit</label>
        <div className="input-row">
          <input
            id="habit-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (formError) setFormError('')
            }}
            placeholder="e.g. Walk for 20 minutes"
            disabled={adding}
          />
          <button type="submit" disabled={adding}>
            {adding ? 'Adding…' : 'Add habit'}
          </button>
        </div>
        {formError && <p className="field-error" role="alert">{formError}</p>}
      </form>

      {actionError && <p className="message error" role="alert">{actionError}</p>}

      {loading ? (
        <div className="message" role="status">Loading habits…</div>
      ) : loadError ? (
        <div className="message error" role="alert">Unable to load habits: {loadError}</div>
      ) : habits.length === 0 ? (
        <div className="empty-state">No habits yet.</div>
      ) : (
        <ul className="habit-list">
          {habits.map((habit) => {
            const isBusy = activeHabitId === habit.id

            return (
              <li key={habit.id}>
                {editingId === habit.id ? (
                  <form className="habit-edit-form" onSubmit={(event) => handleEdit(event, habit)}>
                    <label className="sr-only" htmlFor={`edit-habit-${habit.id}`}>Edit habit name</label>
                    <input
                      id={`edit-habit-${habit.id}`}
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      disabled={isBusy}
                      autoFocus
                    />
                    <button type="submit" disabled={isBusy}>Save</button>
                    <button type="button" onClick={() => setEditingId(null)} disabled={isBusy}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <label className={habit.completed ? 'completed' : ''}>
                      <input
                        type="checkbox"
                        checked={habit.completed}
                        onChange={() => handleToggle(habit)}
                        disabled={isBusy}
                      />
                      <span>{habit.name}</span>
                    </label>
                    <div className="habit-actions">
                      <button type="button" onClick={() => beginEditing(habit)} disabled={isBusy}>Edit</button>
                      <button className="danger-button" type="button" onClick={() => handleDelete(habit)} disabled={isBusy}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
