import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Habit } from '../types/habit';

interface HabitsContextValue {
  habits: Habit[];
  addHabit: (name: string) => void;
}

interface HabitsProviderProps {
  children: ReactNode;
}

const initialHabits: Habit[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    name: 'Drink a glass of water',
    completed: true,
    created_at: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    name: 'Read for 20 minutes',
    completed: false,
    created_at: '2026-01-01T08:05:00.000Z',
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    name: 'Take an evening walk',
    completed: false,
    created_at: '2026-01-01T08:10:00.000Z',
  },
];

const HabitsContext = createContext<HabitsContextValue | null>(null);
let nextHabitNumber = 1;

export function HabitsProvider({ children }: HabitsProviderProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  function addHabit(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const habit: Habit = {
      id: `local-${Date.now()}-${nextHabitNumber++}`,
      user_id: 'demo-user',
      name: trimmedName,
      completed: false,
      created_at: new Date().toISOString(),
    };

    setHabits((currentHabits) => [...currentHabits, habit]);
  }

  return (
    <HabitsContext.Provider value={{ habits, addHabit }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider.');
  }

  return context;
}
