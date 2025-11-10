import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const AppNavigator: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

