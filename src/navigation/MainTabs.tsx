import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import CompareScreen from '../screens/CompareScreen';
import DatabaseScreen from '../screens/DatabaseScreen';
import QuizScreen from '../screens/QuizScreen';
import InteractionsScreen from '../screens/InteractionsScreen';
import { colors } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: colors.white,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkGray,
        tabBarStyle: Platform.select({
          default: { backgroundColor: colors.white },
        }),
      }}
    >
      <Tab.Screen name="Compare" component={CompareScreen} options={{ title: 'Unit vs Unit' }} />
      <Tab.Screen name="Database" component={DatabaseScreen} options={{ title: 'Database' }} />
      <Tab.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Tab.Screen
        name="Interactions"
        component={InteractionsScreen}
        options={{ title: 'Interactions' }}
      />
    </Tab.Navigator>
  );
}
