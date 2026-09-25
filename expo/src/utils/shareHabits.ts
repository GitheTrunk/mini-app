import { Platform, Share } from 'react-native';

import type { Habit } from '../types/habit';

async function shareOnWeb(message: string): Promise<string | null> {
  const webNavigator = typeof navigator === 'undefined' ? undefined : navigator;

  if (typeof webNavigator?.share !== 'function') {
    return 'Sharing is not supported in this browser.';
  }

  try {
    await webNavigator.share({ title: 'My habits', text: message });
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }

    return 'Unable to share habits right now.';
  }
}

export async function shareHabitList(habits: Habit[]): Promise<string | null> {
  const habitLines = habits.map((habit) => `${habit.completed ? '✓' : '○'} ${habit.name}`);
  const message = habitLines.length > 0
    ? `My habits:\n${habitLines.join('\n')}`
    : 'My habit list is empty.';

  const share = Platform.select<() => Promise<string | null>>({
    web: () => shareOnWeb(message),
    default: async () => {
      await Share.share({ title: 'My habits', message });
      return null;
    },
  });

  if (!share) {
    return 'Sharing is not available on this platform.';
  }

  try {
    return await share();
  } catch {
    return 'Unable to share habits right now.';
  }
}
