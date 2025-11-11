import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { logger, LogLevel } from '../utils/logger';
import { database } from '../database/database';
import { TaskRepository } from '../repositories/TaskRepository';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CigaretteRepository } from '../repositories/CigaretteRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';

export const DebugScreen: React.FC = () => {
  const [logs, setLogs] = useState(logger.getRecentLogs(200));
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    loadDatabaseStats();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLogs(logger.getRecentLogs(200));
        loadDatabaseStats();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDatabaseStats = async () => {
    try {
      const tasks = await TaskRepository.getAllTasks().catch(() => []);
      const categories = await CategoryRepository.getAllCategories().catch(() => []);
      const cigarettes = await CigaretteRepository.getAllCigarettes().catch(() => []);
      
      setDbStats({
        tasks: tasks.length,
        categories: categories.length,
        cigarettes: cigarettes.length,
        databaseReady: database !== null,
      });
    } catch (error) {
      logger.error('Error loading database stats', error);
      setDbStats({ error: 'Failed to load stats' });
    }
  };

  const filteredLogs = filter === 'ALL' 
    ? logs 
    : logs.filter((log) => log.level === filter);

  const exportLogs = async () => {
    try {
      const logsJson = logger.exportLogs();
      await Share.share({
        message: logsJson,
        title: 'App Logs',
      });
    } catch (error) {
      logger.error('Error exporting logs', error);
      Alert.alert('خطا', 'نمی‌توان لاگ‌ها را export کرد');
    }
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    Alert.alert('موفق', 'همه لاگ‌ها پاک شدند');
  };

  const testDatabase = async () => {
    try {
      logger.info('Testing database connection...');
      const tasks = await TaskRepository.getAllTasks();
      logger.info('Database test successful', { taskCount: tasks.length });
      Alert.alert('موفق', `اتصال به دیتابیس موفق بود. تعداد کارها: ${tasks.length}`);
    } catch (error) {
      logger.error('Database test failed', error);
      Alert.alert('خطا', `خطا در اتصال به دیتابیس: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const getLogColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG:
        return colors.textSecondary;
      case LogLevel.INFO:
        return colors.info;
      case LogLevel.WARN:
        return colors.warning;
      case LogLevel.ERROR:
        return colors.error;
      default:
        return colors.text;
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fa-IR');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Panel</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={() => setAutoRefresh(!autoRefresh)}
          >
            <Ionicons
              name={autoRefresh ? 'pause' : 'play'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={clearLogs}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSmall]}
            onPress={exportLogs}
          >
            <Ionicons name="share" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Database Stats */}
      {dbStats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Database Stats:</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Tasks: {dbStats.tasks || 0}</Text>
            <Text style={styles.statsText}>Categories: {dbStats.categories || 0}</Text>
            <Text style={styles.statsText}>Cigarettes: {dbStats.cigarettes || 0}</Text>
            <Text style={[styles.statsText, { color: dbStats.databaseReady ? colors.success : colors.error }]}>
              DB: {dbStats.databaseReady ? 'Ready' : 'Not Ready'}
            </Text>
          </View>
          <TouchableOpacity style={styles.testButton} onPress={testDatabase}>
            <Text style={styles.testButtonText}>Test Database</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['ALL', LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              filter === level && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(level)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === level && styles.filterButtonTextActive,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logs */}
      <ScrollView style={styles.logsContainer} contentContainerStyle={styles.logsContent}>
        {filteredLogs.length === 0 ? (
          <Text style={styles.emptyText}>هیچ لاگی یافت نشد</Text>
        ) : (
          filteredLogs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <View style={styles.logHeader}>
                <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                  {log.level}
                </Text>
                <Text style={styles.logTime}>{formatTimestamp(log.timestamp)}</Text>
              </View>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.data && (
                <Text style={styles.logData}>
                  {JSON.stringify(log.data, null, 2)}
                </Text>
              )}
              {log.stack && log.level === LogLevel.ERROR && (
                <Text style={styles.logStack}>{log.stack}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },
  buttonSmall: {
    padding: spacing.xs,
  },
  statsContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  statsText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  testButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  testButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  logsContainer: {
    flex: 1,
  },
  logsContent: {
    padding: spacing.md,
  },
  logEntry: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  logLevel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  logTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textDisabled,
  },
  logMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  logData: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceVariant,
    padding: spacing.xs,
    borderRadius: 4,
    marginTop: spacing.xs,
  },
  logStack: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
    color: colors.error,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

