import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors } from './src/theme';
import { notificationService } from './src/services/NotificationService';
import { CategoryRepository } from './src/repositories/CategoryRepository';
import { SettingsRepository } from './src/repositories/SettingsRepository';

export default function App() {
  useEffect(() => {
    // Initialize default categories and settings
    const initializeApp = async () => {
      try {
        await CategoryRepository.initializeDefaultCategories();
        await SettingsRepository.initializeDefaultSettings();
        await notificationService.requestPermissions();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  const paperTheme = {
    dark: true,
    colors: {
      primary: colors.primary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.surface,
      text: colors.text,
      disabled: colors.textDisabled,
      placeholder: colors.textSecondary,
      backdrop: colors.overlay,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar style="light" />
          <AppNavigator />
        </PaperProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
