import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { HabitsProvider } from './src/context/HabitsContext';
import type { RootStackParamList } from './src/navigation/types';
import AddHabitScreen from './src/screens/AddHabitScreen';
import HabitListScreen from './src/screens/HabitListScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <HabitsProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator initialRouteName="HabitList">
          <Stack.Screen
            name="HabitList"
            component={HabitListScreen}
            options={{ title: 'Habits' }}
          />
          <Stack.Screen
            name="AddHabit"
            component={AddHabitScreen}
            options={{ title: 'Add habit' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </HabitsProvider>
  );
}
