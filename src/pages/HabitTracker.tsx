import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import useAuth from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { Habit } from '../types/habit'

const habitColumns = 'id, user_id, name, completed, created_at'
const habitQueueKey = 'daily-tracker-pending-habits-v1'

interface QueuedHabit {
  id: string
  userId: string
  name: string
  completed: boolean
  createdAt: string
}

function readHabitQueue(): QueuedHabit[] {
  try {
    const storedValue = localStorage.getItem(habitQueueKey)

    if (!storedValue) {
      return []
    }

    const value: unknown = JSON.parse(storedValue)

    if (!Array.isArray(value)) {
      return []
    }

    return value.filter((item): item is QueuedHabit => {
      if (!item || typeof item !== 'object') return false
      const queued = item as Partial<QueuedHabit>
      return typeof queued.id === 'string'
        && typeof queued.userId === 'string'
        && typeof queued.name === 'string'
        && typeof queued.completed === 'boolean'
        && typeof queued.createdAt === 'string'
    })
  } catch {
    return []
  }
}

function writeHabitQueue(queue: QueuedHabit[]) {
  localStorage.setItem(habitQueueKey, JSON.stringify(queue))
}

function pendingHabitsForUser(userId: string): Habit[] {
  return readHabitQueue()
    .filter((habit) => habit.userId === userId)
    .map((habit) => ({
      id: habit.id,
      user_id: habit.userId,
      name: habit.name,
      completed: habit.completed,
      created_at: habit.createdAt,
      pendingSync: true,
    }))
}

function removeFromQueue(userId: string, id: string) {
  writeHabitQueue(readHabitQueue().filter((habit) => habit.userId !== userId || habit.id !== id))
}

export default function HabitTracker() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>(() => user ? pendingHabitsForUser(user.id) : [])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(() => Boolean(user && navigator.onLine))
  const [adding, setAdding] = useState(false)
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')
  const syncInProgress = useRef(false)

  const loadHabits = useCallback(async () => {
    if (!user) {
      setHabits([])
      setLoading(false)
      return
    }

    const pendingHabits = pendingHabitsForUser(user.id)

    if (!navigator.onLine) {
      setHabits((current) => {
        const serverHabits = current.filter((habit) => !habit.pendingSync)
        return [...serverHabits, ...pendingHabits]
      })
      setLoading(false)
      return
    }

    setLoadError('')

    const { data, error } = await supabase
      .from('habits')
      .select(habitColumns)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      setLoadError(error.message)
    } else {
      setHabits([...(data ?? []) as Habit[], ...pendingHabitsForUser(user.id)])
    }

    setLoading(false)
  }, [user])

  const syncQueuedHabits = useCallback(async () => {
    if (!user || !navigator.onLine || syncInProgress.current) {
      return
    }

    syncInProgress.current = true
    setActionError('')

    try {
      const queuedHabits = readHabitQueue().filter((habit) => habit.userId === user.id)

      for (const queuedHabit of queuedHabits) {
        const { data, error } = await supabase
          .from('habits')
          .upsert({
            id: queuedHabit.id,
            user_id: queuedHabit.userId,
            name: queuedHabit.name,
            completed: queuedHabit.completed,
          }, { onConflict: 'id' })
          .select(habitColumns)
          .single()

        if (error) {
          setActionError(`A pending habit could not sync yet: ${error.message}`)
          break
        }

        removeFromQueue(user.id, queuedHabit.id)
        setHabits((current) => current.map((habit) => habit.id === queuedHabit.id ? data as Habit : habit))
      }

      await loadHabits()
    } catch (error) {
      setActionError(error instanceof Error
        ? `Pending habits remain saved on this device: ${error.message}`
        : 'Pending habits remain saved on this device and will retry later.')
    } finally {
      syncInProgress.current = false
    }
  }, [loadHabits, user])

  useEffect(() => {
    if (!user) {
      return
    }

    const handleOnline = () => {
      void syncQueuedHabits()
    }

    window.addEventListener('online', handleOnline)

    const initialSyncTimer = navigator.onLine
      ? window.setTimeout(() => void syncQueuedHabits(), 0)
      : undefined

    return () => {
      if (initialSyncTimer !== undefined) window.clearTimeout(initialSyncTimer)
      window.removeEventListener('online', handleOnline)
    }
  }, [syncQueuedHabits, user])

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

    const queueHabit = () => {
      const queuedHabit: QueuedHabit = {
        id: crypto.randomUUID(),
        userId: user.id,
        name: trimmedName,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      try {
        writeHabitQueue([...readHabitQueue(), queuedHabit])
        setHabits((current) => [...current, {
          id: queuedHabit.id,
          user_id: queuedHabit.userId,
          name: queuedHabit.name,
          completed: queuedHabit.completed,
          created_at: queuedHabit.createdAt,
          pendingSync: true,
        }])
        setName('')
      } catch {
        setFormError('Unable to save this habit on this device.')
      }
    }

    if (!navigator.onLine) {
      queueHabit()
      setAdding(false)
      return
    }

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: trimmedName,
        completed: false,
      })
      .select(habitColumns)
      .single()

    if (error && !navigator.onLine) {
      queueHabit()
    } else if (error) {
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

    if (habit.pendingSync) {
      try {
        removeFromQueue(user.id, habit.id)
        setHabits((current) => current.filter((item) => item.id !== habit.id))
      } catch {
        setActionError('Unable to remove the pending habit from this device.')
      }
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
      {loadError && <p className="message error" role="alert">Unable to load server habits: {loadError}</p>}

      {loading && habits.length === 0 ? (
        <div className="message" role="status">Loading habits…</div>
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
                        disabled={isBusy || habit.pendingSync}
                        aria-label={`${habit.completed ? 'Mark incomplete' : 'Mark complete'}: ${habit.name}`}
                      />
                      <span className="habit-name">{habit.name}</span>
                      {habit.pendingSync && <span className="pending-badge">Pending sync</span>}
                    </label>
                    <div className="habit-actions">
                      <button type="button" onClick={() => beginEditing(habit)} disabled={isBusy || habit.pendingSync}>Edit</button>
                      <button className="danger-button" type="button" onClick={() => handleDelete(habit)} disabled={isBusy}>
                        {habit.pendingSync ? 'Remove' : 'Delete'}
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
