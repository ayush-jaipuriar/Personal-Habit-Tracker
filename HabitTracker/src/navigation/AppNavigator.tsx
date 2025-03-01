import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import HabitsScreen from '../screens/HabitsScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import EditHabitScreen from '../screens/EditHabitScreen';

// Define the types for our navigation
export type RootStackParamList = {
  Main: undefined;
  HabitDetail: { habitId: string };
  AddHabit: undefined;
  EditHabit: { habitId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Habits: undefined;
  Stats: undefined;
  Settings: undefined;
};

// Create the navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator
const MainTabNavigator = () => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Habits') {
            iconName = focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'chart-bar' : 'chart-bar';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        tabBarStyle: {
          backgroundColor: isDarkMode ? theme.colors.surface : theme.colors.background,
          borderTopColor: isDarkMode ? theme.colors.surface : theme.colors.disabled,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Today' }}
      />
      <Tab.Screen 
        name="Habits" 
        component={HabitsScreen} 
        options={{ title: 'My Habits' }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{ title: 'Statistics' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Root stack navigator
const AppNavigator = () => {
  const { navigationTheme } = useTheme();
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen 
          name="HabitDetail" 
          component={HabitDetailScreen} 
          options={{ headerShown: true, title: 'Habit Details' }}
        />
        <Stack.Screen 
          name="AddHabit" 
          component={AddHabitScreen} 
          options={{ headerShown: true, title: 'Add New Habit' }}
        />
        <Stack.Screen 
          name="EditHabit" 
          component={EditHabitScreen} 
          options={{ headerShown: true, title: 'Edit Habit' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 