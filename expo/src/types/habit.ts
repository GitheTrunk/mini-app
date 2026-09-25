export interface Habit {
  id: string;
  user_id: string;
  name: string;
  completed: boolean;
  created_at: string;
  pendingSync?: boolean;
}
