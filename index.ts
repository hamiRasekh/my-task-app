import { registerRootComponent } from 'expo';
import { ErrorUtils } from 'react-native';
import { logger } from './src/utils/logger';
import App from './App';

// Enable debug mode always for comprehensive logging
logger.enableDebugMode();

// Global error handler for unhandled promise rejections and JavaScript errors
if (typeof global !== 'undefined') {
  // Handle unhandled promise rejections
  const originalReject = Promise.reject;
  Promise.reject = function(reason: any) {
    logger.error('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)));
    return originalReject.call(this, reason);
  };

  // Handle JavaScript errors
  if (ErrorUtils && ErrorUtils.getGlobalHandler) {
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      logger.error('Global JavaScript error', error, { isFatal });
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
}

logger.info('Application starting', { 
  platform: require('react-native').Platform.OS,
  isDev: __DEV__,
  timestamp: new Date().toISOString(),
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
