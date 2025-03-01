import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Theme } from '@react-navigation/native';

export const lightColors = {
  primary: '#6200EE',
  primaryDark: '#3700B3',
  secondary: '#03DAC6',
  secondaryDark: '#018786',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#B00020',
  text: '#000000',
  onBackground: '#000000',
  onSurface: '#000000',
  disabled: '#BDBDBD',
  placeholder: '#757575',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF80AB',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
  categoryColors: {
    health: '#4CAF50',
    work: '#2196F3',
    personal: '#9C27B0',
    education: '#FF9800',
    social: '#E91E63',
    other: '#607D8B',
  },
};

export const darkColors = {
  primary: '#BB86FC',
  primaryDark: '#3700B3',
  secondary: '#03DAC6',
  secondaryDark: '#018786',
  background: '#121212',
  surface: '#1E1E1E',
  error: '#CF6679',
  text: '#FFFFFF',
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  disabled: '#757575',
  placeholder: '#BDBDBD',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF80AB',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
  categoryColors: {
    health: '#4CAF50',
    work: '#2196F3',
    personal: '#9C27B0',
    education: '#FF9800',
    social: '#E91E63',
    other: '#607D8B',
  },
};

export const typography = {
  fontSizes: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 20,
    xxxlarge: 24,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

export const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  typography,
  spacing,
};

export const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  typography,
  spacing,
};

// Define a custom type that doesn't require fonts
type CustomNavigationTheme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
  fonts: any; // Add fonts property to satisfy the type checker
};

export const NavigationLightTheme: CustomNavigationTheme = {
  dark: false,
  colors: {
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.text,
    border: lightColors.disabled,
    notification: lightColors.notification,
  },
  fonts: {},
};

export const NavigationDarkTheme: CustomNavigationTheme = {
  dark: true,
  colors: {
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.text,
    border: darkColors.disabled,
    notification: darkColors.notification,
  },
  fonts: {},
}; 