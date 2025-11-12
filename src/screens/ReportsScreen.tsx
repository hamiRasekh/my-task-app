import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, shadows } from '../theme';
import { ReportService } from '../services/ReportService';
import { DateService } from '../services/DateService';
import { RewardService } from '../services/RewardService';
import { CigaretteBarChart } from '../components/cigarette/CigaretteBarChart';
import { CigaretteLineChart } from '../components/cigarette/CigaretteLineChart';
import { BarChart } from 'react-native-gifted-charts';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { AppLogo } from '../components/common/AppLogo';
import { GradientBackground } from '../components/common/GradientBackground';
import { GlassCard } from '../components/common/GlassCard';

const screenWidth = Dimensions.get('window').width;

export const ReportsScreen: React.FC = () => {
  const [taskStats, setTaskStats] = useState<any>(null);
  const [cigaretteStats, setCigaretteStats] = useState<any>(null);
  const [cigaretteReports, setCigaretteReports] = useState<any[]>([]);
  const [dailyTaskData, setDailyTaskData] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const today = DateService.getToday();
      let startDate: string;
      let endDate = today;

      switch (dateRange) {
        case 'week':
          startDate = DateService.addDays(today, -6);
          break;
        case 'month':
          const { start } = DateService.getCurrentMonthRange();
          startDate = start;
          break;
        default:
          startDate = DateService.addDays(today, -30);
      }

      const [taskStatsData, cigaretteStatsData, cigaretteReportsData, pointsData, dailyTaskCompletion] = await Promise.allSettled([
        ReportService.getTaskStats(startDate, endDate).catch(() => ({ total: 0, completed: 0, overdue: 0, completionRate: 0 })),
        ReportService.getCigaretteStats(startDate, endDate).catch(() => ({ today: 0, weekly: 0, monthly: 0, average: 0, streak: 0, percentage: 0 })),
        ReportService.getCigaretteReports(startDate, endDate).catch(() => []),
        RewardService.getTotalPoints(startDate, endDate).catch(() => 0),
        ReportService.getDailyTaskCompletion(startDate, endDate).catch(() => new Map()),
      ]);

      // Extract data safely
      const taskStats = taskStatsData.status === 'fulfilled' ? taskStatsData.value : { total: 0, completed: 0, overdue: 0, completionRate: 0 };
      const cigaretteStats = cigaretteStatsData.status === 'fulfilled' ? cigaretteStatsData.value : { today: 0, weekly: 0, monthly: 0, average: 0, streak: 0, percentage: 0 };
      const cigaretteReports = cigaretteReportsData.status === 'fulfilled' ? cigaretteReportsData.value : [];
      const points = pointsData.status === 'fulfilled' ? pointsData.value : 0;
      const dailyTaskCompletionMap = dailyTaskCompletion.status === 'fulfilled' ? dailyTaskCompletion.value : new Map();

      // Convert daily task completion map to array
      const dailyTaskArray = Array.from(dailyTaskCompletionMap.entries()).map(([date, stats]) => ({
        date,
        completed: stats.completed || 0,
        total: stats.total || 0,
      })).sort((a, b) => DateService.compareDates(a.date, b.date));

      setTaskStats(taskStats);
      setCigaretteStats(cigaretteStats);
      setCigaretteReports(cigaretteReports);
      setDailyTaskData(dailyTaskArray);
      setPoints(points);
    } catch (error) {
      console.error('Error loading reports:', error);
      // Set safe defaults on error
      setTaskStats({ total: 0, completed: 0, overdue: 0, completionRate: 0 });
      setCigaretteStats({ today: 0, weekly: 0, monthly: 0, average: 0, streak: 0, percentage: 0 });
      setCigaretteReports([]);
      setDailyTaskData([]);
      setPoints(0);
    } finally {
      setLoading(false);
    }
  };

  const getTaskChartData = () => {
    if (dailyTaskData.length === 0) return [];
    return dailyTaskData.map((item) => item.completed || 0);
  };

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.content}>
            <LoadingSkeleton width="100%" height={30} marginBottom={spacing.lg} />
            <LoadingSkeleton width="100%" height={150} marginBottom={spacing.md} />
            <LoadingSkeleton width="100%" height={150} marginBottom={spacing.md} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Animated.View style={styles.header} entering={FadeInDown.duration(600)}>
            <AppLogo size="medium" />
            <Text style={styles.subtitle}>گزارش‌ها</Text>
          </Animated.View>

          <Animated.View style={styles.filterContainer} entering={FadeInDown.delay(100).duration(500)}>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === 'week' && styles.filterButtonActive]}
              onPress={() => setDateRange('week')}
            >
              <Text style={[styles.filterButtonText, dateRange === 'week' && styles.filterButtonTextActive]}>
                هفته
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === 'month' && styles.filterButtonActive]}
              onPress={() => setDateRange('month')}
            >
              <Text style={[styles.filterButtonText, dateRange === 'month' && styles.filterButtonTextActive]}>
                ماه
              </Text>
            </TouchableOpacity>
          </Animated.View>

        {/* Task Stats */}
        {taskStats && (
          <Animated.View entering={FadeIn.delay(200).duration(500)}>
            <GlassCard intensity="medium" style={styles.card}>
            <Text style={styles.cardTitle}>آمار کارها</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{taskStats.total}</Text>
                <Text style={styles.statLabel}>کل کارها</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {taskStats.completed}
                </Text>
                <Text style={styles.statLabel}>انجام شده</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {taskStats.overdue}
                </Text>
                <Text style={styles.statLabel}>گذشته از موعد</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                درصد انجام: {taskStats.completionRate}%
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${taskStats.completionRate}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>

            {dailyTaskData.length > 0 ? (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>کارهای انجام شده روزانه</Text>
                <BarChart
                  data={getTaskChartData().map((value, index) => ({
                    value: value || 0,
                    label: dailyTaskData[index] ? DateService.formatDate(dailyTaskData[index].date, 'MM/DD') : `${index + 1}`,
                    frontColor: colors.primary,
                    topLabelComponent: () => (
                      <Text style={styles.topLabel}>{value || 0}</Text>
                    ),
                  }))}
                  width={screenWidth - spacing.xl * 2}
                  height={200}
                  barWidth={20}
                  spacing={8}
                  roundedTop
                  roundedBottom
                  hideRules
                  xAxisThickness={1}
                  xAxisColor={colors.glassBorder}
                  yAxisThickness={1}
                  yAxisColor={colors.glassBorder}
                  yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                  maxValue={Math.max(...dailyTaskData.map(d => d.completed || 0), 5) + 2}
                  noOfSections={5}
                  yAxisLabelWidth={40}
                  showYAxisIndices
                  yAxisIndicesColor={colors.glassBorder}
                  yAxisIndicesHeight={4}
                />
              </View>
            ) : (
              <View style={styles.chartContainer}>
                <Text style={styles.noChartDataText}>داده‌ای برای نمایش وجود ندارد</Text>
              </View>
            )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Cigarette Stats */}
        {cigaretteStats && (
          <Animated.View entering={FadeIn.delay(300).duration(500)}>
            <GlassCard intensity="medium" style={styles.card}>
            <Text style={styles.cardTitle}>آمار سیگار</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.today}</Text>
                <Text style={styles.statLabel}>امروز</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.weekly}</Text>
                <Text style={styles.statLabel}>هفتگی</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.monthly}</Text>
                <Text style={styles.statLabel}>ماهانه</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.average}</Text>
                <Text style={styles.statLabel}>میانگین</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{cigaretteStats.streak}</Text>
                <Text style={styles.statLabel}>روز پشت سر هم</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {cigaretteStats.percentage}%
                </Text>
                <Text style={styles.statLabel}>درصد امروز</Text>
              </View>
            </View>

            {cigaretteReports.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>روند مصرف</Text>
                <CigaretteLineChart data={cigaretteReports} height={200} />
              </View>
            )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Points */}
        <Animated.View entering={FadeIn.delay(400).duration(500)}>
          <GlassCard intensity="medium" style={styles.card}>
          <Text style={styles.cardTitle}>امتیازات</Text>
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={48} color={colors.warning} />
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsLabel}>امتیاز کل</Text>
          </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 100,
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
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.glass,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '40',
    borderColor: colors.primary,
    ...shadows.glow,
  },
  filterButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.glass,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.glass,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  pointsContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  pointsValue: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  pointsLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  topLabel: {
    fontSize: 10,
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
  },
  noChartDataText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
