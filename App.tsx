import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors } from './src/theme';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { logger } from './src/utils/logger';

// Lazy load AppNavigator to prevent crash on import
let AppNavigatorComponent: React.ComponentType | null = null;

const loadAppNavigator = async () => {
  try {
    const module = await import('./src/navigation/AppNavigator');
    AppNavigatorComponent = module.AppNavigator;
    return true;
  } catch (error) {
    logger.error('Error loading AppNavigator', error as Error);
    return false;
  }
};

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [navigatorReady, setNavigatorReady] = useState(false);

  useEffect(() => {
    // Initialize immediately - don't wait for anything
    setIsInitialized(true);
    
    // Load navigator asynchronously
    loadAppNavigator().then((success) => {
      if (success) {
        setNavigatorReady(true);
      } else {
        // Even if navigator fails, show something
        setNavigatorReady(true);
      }
    });

    // Initialize everything else in background - don't block UI
    setTimeout(async () => {
      try {
        logger.info('App started', { platform: Platform.OS, isDev: __DEV__ });
        
        // Initialize database in background (non-blocking)
        setTimeout(async () => {
          try {
            const { initializeDatabase } = await import('./src/database/database');
            const db = await initializeDatabase();
            
            if (db) {
              logger.info('Database initialized');
              
              // Initialize repositories in background
              setTimeout(async () => {
                try {
                  const { CategoryRepository } = await import('./src/repositories/CategoryRepository');
                  const { SettingsRepository } = await import('./src/repositories/SettingsRepository');
                  
                  await Promise.allSettled([
                    CategoryRepository.initializeDefaultCategories().catch(() => null),
                    SettingsRepository.initializeDefaultSettings().catch(() => null),
                  ]);
                  
                  logger.info('Repositories initialized');
                } catch (error) {
                  logger.error('Error initializing repositories', error as Error);
                }
              }, 1000);
            }
          } catch (error) {
            logger.error('Error initializing database', error as Error);
          }
        }, 500);

        // Initialize notifications in background
        if (Platform.OS !== 'web') {
          setTimeout(async () => {
            try {
              const { notificationService } = await import('./src/services/NotificationService');
              await notificationService.requestPermissions().catch(() => null);
            } catch (error) {
              logger.error('Error setting up notifications', error as Error);
            }
          }, 2000);
        }
      } catch (error) {
        logger.error('Error in background initialization', error as Error);
      }
    }, 100);
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

  // Show loading screen while navigator loads
  if (!isInitialized || !navigatorReady || !AppNavigatorComponent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <PaperProvider theme={paperTheme}>
            <StatusBar style="light" />
            <AppNavigatorComponent />
          </PaperProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'System',
  },
});
