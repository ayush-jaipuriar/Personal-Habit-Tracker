import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { CustomLightTheme, CustomDarkTheme, NavigationLightTheme, NavigationDarkTheme } from '../utils/theme';
import { AppSettings } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  theme: typeof CustomLightTheme;
  navigationTheme: typeof NavigationLightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
};

const defaultSettings: AppSettings = {
  darkMode: false,
  notificationsEnabled: true,
  notificationStartTime: '20:00', // 8:00 PM
  notificationInterval: 15, // 15 minutes
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings) as AppSettings;
          setSettings(parsedSettings);
          setIsDarkMode(parsedSettings.darkMode);
        } else {
          // If no saved settings, use device preference for dark mode
          setIsDarkMode(colorScheme === 'dark');
          setSettings({
            ...defaultSettings,
            darkMode: colorScheme === 'dark',
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, [colorScheme]);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [settings]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    setSettings({
      ...settings,
      darkMode: !isDarkMode,
    });
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings({
      ...settings,
      ...newSettings,
    });

    // If dark mode setting is updated, also update the theme
    if (newSettings.darkMode !== undefined) {
      setIsDarkMode(newSettings.darkMode);
    }
  };

  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;
  const navigationTheme = isDarkMode ? NavigationDarkTheme : NavigationLightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        navigationTheme,
        isDarkMode,
        toggleTheme,
        settings,
        updateSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 