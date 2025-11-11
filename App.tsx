import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { colors } from './src/theme';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { logger } from './src/utils/logger';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    logger.info('App started', { platform: Platform.OS, isDev: __DEV__ });
    
    // Initialize app with comprehensive error handling
    // Show UI immediately, initialize everything in background
    const initializeApp = async () => {
      try {
        logger.debug('Starting app initialization...');
        
        // Mark as initialized immediately to show UI
        // This prevents blocking the UI thread
        setIsInitialized(true);
        
        // Initialize everything in background with delays
        setTimeout(async () => {
          try {
            // Delay to ensure UI is rendered first
            await new Promise((resolve) => setTimeout(resolve, 500));
            
            logger.debug('Initializing database...');
            
            // Import and initialize database lazily
            try {
              const { initializeDatabase } = await import('./src/database/database');
              const db = await initializeDatabase();
              
              if (!db) {
                logger.warn('Database initialization failed, app will continue with limited functionality');
              } else {
                logger.info('Database initialized successfully');
                
                // Initialize repositories after database is ready
                setTimeout(async () => {
                  try {
                    const { CategoryRepository } = await import('./src/repositories/CategoryRepository');
                    const { SettingsRepository } = await import('./src/repositories/SettingsRepository');
                    
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

                    await Promise.race([
                      Promise.allSettled(initPromises),
                      new Promise((resolve) => setTimeout(resolve, 5000)),
                    ]).catch((error) => {
                      logger.error('Initialization timeout or error', error);
                    });

                    logger.info('Repository initialization completed');
                  } catch (error) {
                    logger.error('Error initializing repositories', error);
                  }
                }, 1000);
              }
            } catch (error) {
              logger.error('Error importing database module', error);
            }
            
            // Initialize notifications separately with delay
            if (Platform.OS !== 'web') {
              setTimeout(async () => {
                try {
                  const { notificationService } = await import('./src/services/NotificationService');
                  logger.debug('Setting up notifications...');
                  await notificationService.requestPermissions().catch((error) => {
                    logger.warn('Error requesting notification permissions', error);
                  });
                  logger.info('Notification permissions requested');
                } catch (error) {
                  logger.error('Error setting up notifications', error);
                }
              }, 3000);
            } else {
              logger.info('Notifications skipped (web platform)');
            }
          } catch (error) {
            logger.error('Error in background initialization', error);
            // Don't block app - continue without database
          }
        }, 100); // Small initial delay
        
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

  // Show loading screen very briefly
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
