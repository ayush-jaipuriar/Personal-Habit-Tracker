import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { HabitProvider } from './src/context/HabitContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initNotifications } from './src/services/notificationService';

// Main app component wrapped with providers
const Main = () => {
  const { theme, isDarkMode } = useTheme();
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);

  // Initialize notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await initNotifications();
        setNotificationsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        // Continue with the app even if notifications fail
        setNotificationsInitialized(false);
      }
    };

    setupNotifications();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <AppNavigator />
      </SafeAreaProvider>
    </PaperProvider>
  );
};

// Root component with all providers
export default function App() {
  return (
    <ThemeProvider>
      <HabitProvider>
        <Main />
      </HabitProvider>
    </ThemeProvider>
  );
}
