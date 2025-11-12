import { registerRootComponent } from 'expo';
import { ErrorUtils } from 'react-native';
import App from './App';

// Safe logger initialization - don't crash if logger fails
let logger: any = null;
try {
  const loggerModule = require('./src/utils/logger');
  logger = loggerModule.logger;
  if (logger && typeof logger.enableDebugMode === 'function') {
    logger.enableDebugMode();
  }
} catch (error) {
  // Logger failed to load - use console as fallback
  console.warn('Logger failed to load, using console fallback', error);
  logger = {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.log,
    enableDebugMode: () => {},
  };
}

// Global error handler for unhandled promise rejections and JavaScript errors
if (typeof global !== 'undefined') {
  try {
    // Handle unhandled promise rejections
    const originalReject = Promise.reject;
    Promise.reject = function(reason: any) {
      try {
        if (logger) {
          logger.error('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)));
        } else {
          console.error('Unhandled promise rejection', reason);
        }
      } catch (e) {
        console.error('Error in promise rejection handler', e);
      }
      return originalReject.call(this, reason);
    };

    // Handle JavaScript errors
    if (ErrorUtils && ErrorUtils.getGlobalHandler) {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        try {
          if (logger) {
            logger.error('Global JavaScript error', error, { isFatal });
          } else {
            console.error('Global JavaScript error', error, { isFatal });
          }
        } catch (e) {
          console.error('Error in global error handler', e);
        }
        if (originalHandler) {
          try {
            originalHandler(error, isFatal);
          } catch (e) {
            console.error('Error in original error handler', e);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error setting up global error handlers', error);
  }
}

try {
  if (logger) {
    logger.info('Application starting', { 
      platform: require('react-native').Platform.OS,
      isDev: __DEV__,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.log('Application starting');
  }
} catch (error) {
  console.log('Application starting (logger unavailable)');
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
try {
  registerRootComponent(App);
} catch (error) {
  console.error('Fatal error registering root component', error);
  throw error;
}
