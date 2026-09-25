import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useHabits } from '../context/HabitsContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHabit'>;

export default function AddHabitScreen({ navigation }: Props) {
  const { addHabit } = useHabits();
  const [name, setName] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  function handleAddHabit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationMessage('Enter a habit name.');
      return;
    }

    addHabit(trimmedName);
    setName('');
    setValidationMessage('');
    navigation.goBack();
  }

  return (
    <View className="flex-1 bg-emerald-50 px-5 pt-8">
      <Text className="text-3xl font-bold text-emerald-950">Add a habit</Text>
      <Text className="mt-2 text-base text-emerald-800">Choose one small action you want to repeat.</Text>

      <Text className="mb-2 mt-8 font-semibold text-slate-800">Habit name</Text>
      <TextInput
        accessibilityLabel="Habit name"
        className="rounded-xl border border-emerald-200 bg-white px-4 py-4 text-base text-slate-900"
        onChangeText={setName}
        onSubmitEditing={handleAddHabit}
        placeholder="e.g. Stretch for 10 minutes"
        placeholderTextColor="#64748b"
        returnKeyType="done"
        value={name}
      />

      {validationMessage ? (
        <Text className="mt-2 text-sm font-medium text-red-700" accessibilityLiveRegion="polite">
          {validationMessage}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        className="mt-6 rounded-xl bg-emerald-700 px-5 py-4"
        onPress={handleAddHabit}
      >
        <Text className="text-center text-base font-bold text-white">Add Habit</Text>
      </Pressable>
    </View>
  );
}
