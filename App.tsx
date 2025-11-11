import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors } from './src/theme';
import { notificationService } from './src/services/NotificationService';
import { CategoryRepository } from './src/repositories/CategoryRepository';
import { SettingsRepository } from './src/repositories/SettingsRepository';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { logger } from './src/utils/logger';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    logger.info('App started', { platform: Platform.OS, isDev: __DEV__ });
    
    // Initialize app with comprehensive error handling
    // Show UI immediately, initialize database in background
    const initializeApp = async () => {
      try {
        logger.debug('Starting app initialization...');
        
        // Mark as initialized immediately to show UI
        // This prevents blocking the UI thread
        setIsInitialized(true);
        
        // Initialize database and repositories in background
        // Don't block UI - let it happen asynchronously
        (async () => {
          try {
            // Small delay to ensure UI is rendered first
            await new Promise((resolve) => setTimeout(resolve, 100));
            
            logger.debug('Checking database status...');
            
            // Import database module
            const dbModule = await import('./src/database/database');
            
            // Check if database is ready
            if (!dbModule.isDatabaseReady()) {
              logger.debug('Database not ready, initializing...');
              const db = await dbModule.initializeDatabase();
              
              if (!db) {
                logger.warn('Database initialization failed, app will continue with limited functionality');
                // Don't return - continue with other initialization
              } else {
                logger.info('Database initialized successfully');
              }
            } else {
              logger.info('Database already initialized');
            }
            
            // Initialize repositories with extensive error handling
            logger.debug('Initializing repositories...');
            
            const initPromises = [
              CategoryRepository.initializeDefaultCategories().catch((error) => {
                logger.error('Error initializing categories', error);
                return null;
              }),
              SettingsRepository.initializeDefaultSettings().catch((error) => {
                logger.error('Error initializing settings', error);
                return null;
              }),
            ];

            // Wait for initialization with timeout (3 seconds)
            await Promise.race([
              Promise.allSettled(initPromises),
              new Promise((resolve) => setTimeout(resolve, 3000)),
            ]).catch((error) => {
              logger.error('Initialization timeout or error', error);
            });

            logger.info('Repository initialization completed');

            // Initialize notifications separately with delay
            if (Platform.OS !== 'web') {
              logger.debug('Setting up notifications...');
              setTimeout(async () => {
                try {
                  await notificationService.requestPermissions().catch((error) => {
                    logger.warn('Error requesting notification permissions', error);
                  });
                  logger.info('Notification permissions requested');
                } catch (error) {
                  logger.error('Error setting up notifications', error);
                }
              }, 2000);
            } else {
              logger.info('Notifications skipped (web platform)');
            }
          } catch (error) {
            logger.error('Error in background initialization', error);
            // Don't block app - continue without database
          }
        })(); // Execute immediately but don't wait
        
      } catch (error) {
        logger.error('Error initializing app', error);
        // Always mark as initialized - app should start even if initialization fails
        setIsInitialized(true);
      }
    };

    // Wrap in try-catch to handle any synchronous errors
    try {
      initializeApp();
    } catch (error) {
      logger.error('Fatal error in App initialization', error);
      // Always mark as initialized so UI can render
      setIsInitialized(true);
    }
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

  // Show loading screen while initializing (very brief)
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <PaperProvider theme={paperTheme}>
            <StatusBar style="light" />
            <AppNavigator />
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
});
