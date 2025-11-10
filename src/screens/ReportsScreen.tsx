import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { ReportService } from '../services/ReportService';
import { DateService } from '../services/DateService';
import { RewardService } from '../services/RewardService';
import { CigaretteBarChart } from '../components/cigarette/CigaretteBarChart';
import { CigaretteLineChart } from '../components/cigarette/CigaretteLineChart';
import { BarChart } from 'react-native-gifted-charts';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { AppLogo } from '../components/common/AppLogo';

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

      const [taskStatsData, cigaretteStatsData, cigaretteReportsData, pointsData, dailyTaskCompletion] = await Promise.all([
        ReportService.getTaskStats(startDate, endDate),
        ReportService.getCigaretteStats(startDate, endDate),
        ReportService.getCigaretteReports(startDate, endDate),
        RewardService.getTotalPoints(startDate, endDate),
        ReportService.getDailyTaskCompletion(startDate, endDate),
      ]);

      // Convert daily task completion map to array
      const dailyTaskArray = Array.from(dailyTaskCompletion.entries()).map(([date, stats]) => ({
        date,
        completed: stats.completed,
        total: stats.total,
      })).sort((a, b) => DateService.compareDates(a.date, b.date));

      setTaskStats(taskStatsData);
      setCigaretteStats(cigaretteStatsData);
      setCigaretteReports(cigaretteReportsData);
      setDailyTaskData(dailyTaskArray);
      setPoints(pointsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskChartData = () => {
    if (dailyTaskData.length === 0) return [];
    return dailyTaskData.map((item) => item.completed);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <LoadingSkeleton width="100%" height={30} marginBottom={spacing.lg} />
          <LoadingSkeleton width="100%" height={150} marginBottom={spacing.md} />
          <LoadingSkeleton width="100%" height={150} marginBottom={spacing.md} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppLogo size="medium" />
          <Text style={styles.subtitle}>گزارش‌ها</Text>
        </View>

        <View style={styles.filterContainer}>
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
        </View>

        {/* Task Stats */}
        {taskStats && (
          <View style={styles.card}>
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

            {dailyTaskData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>کارهای انجام شده روزانه</Text>
                <BarChart
                  data={getTaskChartData().map((value, index) => ({
                    value: value,
                    label: dailyTaskData[index] ? DateService.formatDate(dailyTaskData[index].date, 'MM/DD') : `${index + 1}`,
                    frontColor: colors.primary,
                    topLabelComponent: () => (
                      <Text style={styles.topLabel}>{value}</Text>
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
                  xAxisColor={colors.border}
                  yAxisThickness={1}
                  yAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                  maxValue={Math.max(...dailyTaskData.map(d => d.completed), 5) + 2}
                  noOfSections={5}
                  yAxisLabelWidth={40}
                  showYAxisIndices
                  yAxisIndicesColor={colors.border}
                  yAxisIndicesHeight={4}
                />
              </View>
            )}
          </View>
        )}

        {/* Cigarette Stats */}
        {cigaretteStats && (
          <View style={styles.card}>
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
          </View>
        )}

        {/* Points */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>امتیازات</Text>
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={48} color={colors.warning} />
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsLabel}>امتیاز کل</Text>
          </View>
        </View>
      </ScrollView>
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
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
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
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
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
});
