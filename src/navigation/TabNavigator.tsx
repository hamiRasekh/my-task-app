import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';
import { logger } from '../utils/logger';

// Lazy load screens to prevent crash on import
const HomeScreen = lazy(() => import('../screens/HomeScreen').then(m => ({ default: m.HomeScreen })).catch(() => {
  logger.error('Error loading HomeScreen');
  return { default: () => <View /> };
}));

const TasksScreen = lazy(() => import('../screens/TasksScreen').then(m => ({ default: m.TasksScreen })).catch(() => {
  logger.error('Error loading TasksScreen');
  return { default: () => <View /> };
}));

const CigaretteTrackerScreen = lazy(() => import('../screens/CigaretteTrackerScreen').then(m => ({ default: m.CigaretteTrackerScreen })).catch(() => {
  logger.error('Error loading CigaretteTrackerScreen');
  return { default: () => <View /> };
}));

const ReportsScreen = lazy(() => import('../screens/ReportsScreen').then(m => ({ default: m.ReportsScreen })).catch(() => {
  logger.error('Error loading ReportsScreen');
  return { default: () => <View /> };
}));

const SettingsScreen = lazy(() => import('../screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })).catch(() => {
  logger.error('Error loading SettingsScreen');
  return { default: () => <View /> };
}));

const DebugScreen = lazy(() => import('../screens/DebugScreen').then(m => ({ default: m.DebugScreen })).catch(() => {
  logger.error('Error loading DebugScreen');
  return { default: () => <View /> };
}));

const Tab = createBottomTabNavigator();

// Loading fallback for lazy components
const ScreenLoader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: typography.fontSize.xs,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: 'خانه',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <HomeScreen />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Tasks"
        options={{
          title: 'کارها',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <TasksScreen />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Cigarette"
        options={{
          title: 'سیگار',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <CigaretteTrackerScreen />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Reports"
        options={{
          title: 'گزارش',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <ReportsScreen />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          title: 'تنظیمات',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <SettingsScreen />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Debug"
        options={{
          title: 'Debug',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <DebugScreen />
          </Suspense>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

