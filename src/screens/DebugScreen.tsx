import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { colors, typography, spacing, shadows } from '../theme';
import { logger, LogLevel } from '../utils/logger';
import { GradientBackground } from '../components/common/GradientBackground';
import { GlassCard } from '../components/common/GlassCard';
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
  const [logFilePath, setLogFilePath] = useState<string | null>(null);

  useEffect(() => {
    loadDatabaseStats();
    loadLogFilePath();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLogs(logger.getRecentLogs(200));
        loadDatabaseStats();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLogFilePath = async () => {
    try {
      const path = await logger.getLogFilePath();
      setLogFilePath(path);
    } catch (error) {
      logger.error('Error loading log file path', error);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const { isDatabaseReady } = await import('../database/database');
      const dbReady = isDatabaseReady();
      
      const tasks = await TaskRepository.getAllTasks().catch(() => []);
      const categories = await CategoryRepository.getAllCategories().catch(() => []);
      const cigarettes = await CigaretteRepository.getAllCigarettes().catch(() => []);
      
      setDbStats({
        tasks: tasks.length,
        categories: categories.length,
        cigarettes: cigarettes.length,
        databaseReady: dbReady,
      });
    } catch (error) {
      logger.error('Error loading database stats', error);
      setDbStats({ 
        tasks: 0,
        categories: 0,
        cigarettes: 0,
        databaseReady: false,
        error: 'Failed to load stats' 
      });
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
    return date.toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const copyLog = async (log: any) => {
    try {
      const logText = `[${log.level}] ${formatTimestamp(log.timestamp)}\n${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}${log.stack ? '\n\nStack:\n' + log.stack : ''}`;
      await Clipboard.setStringAsync(logText);
      Alert.alert('موفق', 'لاگ کپی شد');
    } catch (error) {
      logger.error('Error copying log', error);
      Alert.alert('خطا', 'نمی‌توان لاگ را کپی کرد');
    }
  };

  const copyLogFilePath = async () => {
    if (!logFilePath) {
      Alert.alert('خطا', 'آدرس فایل لاگ در دسترس نیست');
      return;
    }
    try {
      await Clipboard.setStringAsync(logFilePath);
      Alert.alert('موفق', `آدرس فایل کپی شد:\n${logFilePath}`);
    } catch (error) {
      logger.error('Error copying log file path', error);
      Alert.alert('خطا', 'نمی‌توان آدرس را کپی کرد');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Animated.View style={styles.header} entering={FadeInDown.duration(600)}>
          <GlassCard intensity="medium" style={styles.headerCard}>
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
          </GlassCard>
        </Animated.View>

        {/* Log File Path */}
        {logFilePath && (
          <Animated.View entering={FadeIn.delay(100).duration(500)}>
            <GlassCard intensity="light" style={styles.logPathContainer}>
              <Text style={styles.logPathLabel}>آدرس فایل لاگ:</Text>
              <Text style={styles.logPathText} numberOfLines={2}>{logFilePath}</Text>
              <TouchableOpacity style={styles.copyPathButton} onPress={copyLogFilePath}>
                <Ionicons name="copy" size={16} color={colors.primary} />
                <Text style={styles.copyPathButtonText}>کپی آدرس</Text>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>
        )}

        {/* Database Stats */}
        {dbStats && (
          <Animated.View entering={FadeIn.delay(200).duration(500)}>
            <GlassCard intensity="medium" style={styles.statsContainer}>
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
            </GlassCard>
          </Animated.View>
        )}

        {/* Filter Buttons */}
        <Animated.View style={styles.filterContainer} entering={FadeInDown.delay(300).duration(500)}>
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
        </Animated.View>

        {/* Logs */}
        <ScrollView style={styles.logsContainer} contentContainerStyle={styles.logsContent}>
          {filteredLogs.length === 0 ? (
            <Text style={styles.emptyText}>هیچ لاگی یافت نشد</Text>
          ) : (
            filteredLogs.map((log, index) => (
              <Animated.View
                key={index}
                entering={FadeIn.delay(400 + index * 50).duration(300)}
              >
                <TouchableOpacity 
                  style={styles.logEntry}
                  onPress={() => copyLog(log)}
                  activeOpacity={0.7}
                >
                  <GlassCard intensity="light" style={styles.logEntryCard}>
                    <View style={styles.logHeader}>
                      <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                        {log.level}
                      </Text>
                      <View style={styles.logHeaderRight}>
                        <Text style={styles.logTime}>{formatTimestamp(log.timestamp)}</Text>
                        <Ionicons name="copy-outline" size={14} color={colors.textSecondary} style={styles.copyIcon} />
                      </View>
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
                  </GlassCard>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    ...shadows.glass,
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
    borderRadius: 12,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  buttonSmall: {
    padding: spacing.xs,
  },
  statsContainer: {
    padding: spacing.md,
    margin: spacing.md,
    marginTop: 0,
    marginBottom: spacing.sm,
    ...shadows.glass,
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
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.glow,
  },
  testButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '40',
    borderColor: colors.primary,
    ...shadows.glow,
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
    paddingTop: 0,
    paddingBottom: 100,
  },
  logEntry: {
    marginBottom: spacing.sm,
  },
  logEntryCard: {
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.glassBorder,
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
  logPathContainer: {
    padding: spacing.md,
    margin: spacing.md,
    marginTop: 0,
    marginBottom: spacing.sm,
    ...shadows.glass,
  },
  logPathLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  logPathText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  copyPathButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  copyPathButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  logHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  copyIcon: {
    marginLeft: spacing.xs,
  },
});

