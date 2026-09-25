import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useHabits } from '../context/HabitsContext';
import type { RootStackParamList } from '../navigation/types';
import type { Habit } from '../types/habit';
import { shareHabitList } from '../utils/shareHabits';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitList'>;

export default function HabitListScreen({ navigation }: Props) {
  const { habits } = useHabits();
  const [shareMessage, setShareMessage] = useState('');

  async function handleShare() {
    setShareMessage('');
    const message = await shareHabitList(habits);
    setShareMessage(message ?? 'Habit list shared.');
  }

  return (
    <View className="flex-1 bg-emerald-50 px-5 pt-6">
      <View className="mb-5">
        <Text className="text-3xl font-bold text-emerald-950">Daily habits</Text>
        <Text className="mt-1 text-base text-emerald-800">Small steps, repeated every day.</Text>
      </View>

      <FlatList<Habit>
        className="flex-1"
        data={habits}
        keyExtractor={(habit) => habit.id}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <Text className="text-lg font-semibold text-slate-900">{item.name}</Text>
            <Text className={item.completed ? 'mt-1 text-emerald-700' : 'mt-1 text-slate-500'}>
              {item.completed ? 'Completed' : 'Not completed'}
            </Text>
          </View>
        )}
        ListEmptyComponent={(
          <View className="rounded-xl border border-dashed border-emerald-300 bg-white p-6">
            <Text className="text-center text-slate-600">No habits yet. Add your first habit.</Text>
          </View>
        )}
      />

      {shareMessage ? (
        <Text className="mb-3 text-center text-sm text-slate-600" accessibilityLiveRegion="polite">
          {shareMessage}
        </Text>
      ) : null}

      <View className="gap-3 pb-6">
        <Pressable
          accessibilityRole="button"
          className="rounded-xl bg-emerald-700 px-5 py-4"
          onPress={() => navigation.navigate('AddHabit')}
        >
          <Text className="text-center text-base font-bold text-white">Add Habit</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="rounded-xl border border-emerald-700 bg-white px-5 py-3"
          onPress={() => void handleShare()}
        >
          <Text className="text-center font-semibold text-emerald-800">Share Habits</Text>
        </Pressable>
      </View>
    </View>
  );
}
