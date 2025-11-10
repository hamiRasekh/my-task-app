import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { useTaskStore } from '../store/taskStore';
import { useCigaretteStore } from '../store/cigaretteStore';
import { useUIStore } from '../store/uiStore';
import { DateService } from '../services/DateService';
import { RewardService } from '../services/RewardService';
import { CigaretteCircularChart } from '../components/cigarette/CigaretteCircularChart';
import { TaskCard } from '../components/task/TaskCard';
import { EmptyState } from '../components/common/EmptyState';
import { TaskModal } from '../components/modals/TaskModal';
import { AppLogo } from '../components/common/AppLogo';
import Task from '../database/models/Task';

export const HomeScreen: React.FC = () => {
  const { tasks, loadTasks, loadCategories, completeTask, deleteTask } = useTaskStore();
  const { todayCigarette, loadTodayCigarette } = useCigaretteStore();
  const { openTaskModal } = useUIStore();
  const [todayPoints, setTodayPoints] = useState(0);

  useEffect(() => {
    const refreshData = () => {
      loadTasks();
      loadCategories();
      loadTodayCigarette();
      loadTodayPoints();
    };
    
    refreshData();
  }, []);

  const loadTodayPoints = async () => {
    try {
      const points = await RewardService.getTodayPoints();
      setTodayPoints(points);
    } catch (error) {
      console.error('Error loading points:', error);
    }
  };

  const today = DateService.getToday();
  const todayTasks = tasks
    .filter((task) => task.scheduledDate === today && !task.isCompleted)
    .slice(0, 5);
  const completedTodayTasks = tasks.filter(
    (task) => task.scheduledDate === today && task.isCompleted
  ).length;
  const allTodayTasks = tasks.filter((task) => task.scheduledDate === today);

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
    await loadTodayPoints();
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppLogo size="medium" />
          <Text style={styles.subtitle}>خانه</Text>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={styles.statValue}>{completedTodayTasks}</Text>
            <Text style={styles.statLabel}>انجام شده</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color={colors.warning} />
            <Text style={styles.statValue}>{todayTasks.length}</Text>
            <Text style={styles.statLabel}>باقیمانده</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{todayPoints}</Text>
            <Text style={styles.statLabel}>امتیاز</Text>
          </View>
        </View>

        {/* Cigarette Card */}
        {todayCigarette && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>سیگار امروز</Text>
            <View style={styles.cigaretteContainer}>
              <View style={styles.cigaretteInfo}>
                <Text style={styles.cigaretteCount}>
                  {todayCigarette.count} / {todayCigarette.dailyLimit}
                </Text>
                <Text style={styles.cigarettePercentage}>
                  {Math.round((todayCigarette.count / todayCigarette.dailyLimit) * 100)}%
                </Text>
              </View>
              <CigaretteCircularChart cigarette={todayCigarette} size={120} />
            </View>
          </View>
        )}

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>کارهای امروز</Text>
            <TouchableOpacity onPress={() => openTaskModal()}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {todayTasks.length > 0 ? (
            <>
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() => openTaskModal(task.id)}
                  onComplete={() => handleCompleteTask(task.id)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
              {allTodayTasks.length > 5 && (
                <Text style={styles.moreText}>
                  و {allTodayTasks.length - 5} کار دیگر...
                </Text>
              )}
            </>
          ) : (
            <EmptyState
              title="هیچ کاری برای امروز ندارید"
              message="برای افزودن کار جدید، دکمه + را بزنید"
            />
          )}
        </View>
      </ScrollView>
      <TaskModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  cigaretteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cigaretteInfo: {
    flex: 1,
  },
  cigaretteCount: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cigarettePercentage: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  moreText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

