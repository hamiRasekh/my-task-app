import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, typography, spacing, shadows } from '../theme';
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
import { GradientBackground } from '../components/common/GradientBackground';
import { GlassCard } from '../components/common/GlassCard';
import Task from '../database/models/Task';

export const HomeScreen: React.FC = () => {
  const { tasks, loadTasks, loadCategories, completeTask, deleteTask } = useTaskStore();
  const { todayCigarette, loadTodayCigarette } = useCigaretteStore();
  const { openTaskModal } = useUIStore();
  const [todayPoints, setTodayPoints] = useState(0);

  useEffect(() => {
    const refreshData = async () => {
      try {
        await Promise.all([
          loadTasks().catch((error) => {
            console.warn('Error loading tasks:', error);
          }),
          loadCategories().catch((error) => {
            console.warn('Error loading categories:', error);
          }),
          loadTodayCigarette().catch((error) => {
            console.warn('Error loading cigarette data:', error);
          }),
          loadTodayPoints().catch((error) => {
            console.warn('Error loading points:', error);
          }),
        ]);
      } catch (error) {
        console.error('Error refreshing data:', error);
        // Continue even if some data fails to load
      }
    };
    
    // Delay data loading to ensure database is ready
    const timer = setTimeout(() => {
      refreshData();
    }, 500);
    
    return () => clearTimeout(timer);
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
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Animated.View style={styles.header} entering={FadeInDown.duration(600)}>
            <AppLogo size="medium" />
            <Text style={styles.subtitle}>خانه</Text>
          </Animated.View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              style={styles.statCardWrapper}
            >
              <GlassCard intensity="medium" style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                <Text style={styles.statValue}>{completedTodayTasks}</Text>
                <Text style={styles.statLabel}>انجام شده</Text>
              </GlassCard>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              style={styles.statCardWrapper}
            >
              <GlassCard intensity="medium" style={styles.statCard}>
                <Ionicons name="time" size={32} color={colors.warning} />
                <Text style={styles.statValue}>{todayTasks.length}</Text>
                <Text style={styles.statLabel}>باقیمانده</Text>
              </GlassCard>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              style={styles.statCardWrapper}
            >
              <GlassCard intensity="medium" style={styles.statCard}>
                <Ionicons name="star" size={32} color={colors.primary} />
                <Text style={styles.statValue}>{todayPoints}</Text>
                <Text style={styles.statLabel}>امتیاز</Text>
              </GlassCard>
            </Animated.View>
          </View>

          {/* Cigarette Card */}
          {todayCigarette && (
            <Animated.View entering={FadeIn.delay(400).duration(500)}>
              <GlassCard intensity="medium" style={styles.section}>
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
              </GlassCard>
            </Animated.View>
          )}

          {/* Today's Tasks */}
          <Animated.View entering={FadeIn.delay(500).duration(500)}>
            <GlassCard intensity="medium" style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>کارهای امروز</Text>
                <TouchableOpacity onPress={() => openTaskModal()}>
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {todayTasks.length > 0 ? (
                <>
                  {todayTasks.map((task, index) => (
                    <Animated.View
                      key={task.id}
                      entering={FadeInDown.delay(600 + index * 100).duration(400)}
                    >
                      <TaskCard
                        task={task}
                        onPress={() => openTaskModal(task.id)}
                        onComplete={() => handleCompleteTask(task.id)}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    </Animated.View>
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
            </GlassCard>
          </Animated.View>
        </ScrollView>
        <TaskModal />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100, // Space for tab bar
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
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.glass,
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
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.glass,
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

