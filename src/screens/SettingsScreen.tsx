import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { colors, typography, spacing, shadows } from '../theme';
import { useSettingsStore } from '../store/settingsStore';
import { ExportService } from '../services/ExportService';
import { Alert } from 'react-native';
import { AppLogo } from '../components/common/AppLogo';
import { GradientBackground } from '../components/common/GradientBackground';
import { GlassCard } from '../components/common/GlassCard';
import { APP_NAME } from '../utils/constants';

export const SettingsScreen: React.FC = () => {
  const { settings, loading, loadSettings, updateNotificationSettings, updateDisplaySettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const handleExport = async () => {
    try {
      const jsonData = await ExportService.exportToJSON();
      Alert.alert('موفق', 'داده‌ها با موفقیت export شدند', [
        { text: 'باشه' }
      ]);
      console.log('Exported data:', jsonData);
    } catch (error) {
      Alert.alert('خطا', 'خطا در export داده‌ها', [
        { text: 'باشه' }
      ]);
    }
  };

  const handleBackup = async () => {
    try {
      await ExportService.saveExportToFile('backup.json');
      Alert.alert('موفق', 'پشتیبان‌گیری با موفقیت انجام شد', [
        { text: 'باشه' }
      ]);
    } catch (error) {
      Alert.alert('خطا', 'خطا در پشتیبان‌گیری', [
        { text: 'باشه' }
      ]);
    }
  };

  if (loading || !settings) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.content}>
            <Text style={styles.loadingText}>در حال بارگذاری...</Text>
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
            <Text style={styles.subtitle}>تنظیمات</Text>
          </Animated.View>

          {/* Notification Settings */}
          <Animated.View entering={FadeIn.delay(100).duration(500)}>
            <GlassCard intensity="medium" style={styles.section}>
          <Text style={styles.sectionTitle}>نوتیفیکیشن‌ها</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>فعال‌سازی نوتیفیکیشن</Text>
            <Switch
              value={settings.notifications.enabled}
              onValueChange={(value) => updateNotificationSettings({ enabled: value })}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>صدا</Text>
            <Switch
              value={settings.notifications.sound}
              onValueChange={(value) => updateNotificationSettings({ sound: value })}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>لرزش</Text>
            <Switch
              value={settings.notifications.vibration}
              onValueChange={(value) => updateNotificationSettings({ vibration: value })}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>خلاصه روزانه</Text>
            <Switch
              value={settings.notifications.dailySummary}
              onValueChange={(value) => updateNotificationSettings({ dailySummary: value })}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>یادآوری کارها</Text>
            <Switch
              value={settings.notifications.taskReminders}
              onValueChange={(value) => updateNotificationSettings({ taskReminders: value })}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>یادآوری مهلت</Text>
            <Switch
              value={settings.notifications.deadlineReminders}
              onValueChange={(value) => updateNotificationSettings({ deadlineReminders: value })}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>هشدار سیگار</Text>
            <Switch
              value={settings.notifications.cigaretteWarnings}
              onValueChange={(value) => updateNotificationSettings({ cigaretteWarnings: value })}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
            </GlassCard>
          </Animated.View>

        {/* Display Settings */}
        <Animated.View entering={FadeIn.delay(200).duration(500)}>
          <GlassCard intensity="medium" style={styles.section}>
            <Text style={styles.sectionTitle}>نمایش</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>نمایش فشرده</Text>
              <Switch
                value={settings.display.compactView}
                onValueChange={(value) => updateDisplaySettings({ compactView: value })}
                trackColor={{ false: colors.glass, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Backup & Export */}
        <Animated.View entering={FadeIn.delay(300).duration(500)}>
          <GlassCard intensity="medium" style={styles.section}>
            <Text style={styles.sectionTitle}>پشتیبان‌گیری و Export</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleBackup}>
              <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>پشتیبان‌گیری</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
              <Ionicons name="download-outline" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>Export داده‌ها</Text>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeIn.delay(400).duration(500)}>
          <GlassCard intensity="medium" style={styles.section}>
            <Text style={styles.sectionTitle}>درباره اپ</Text>
            <View style={styles.appInfoContainer}>
              <AppLogo size="small" showSubtitle />
            </View>
            <Text style={styles.infoText}>نسخه: 1.2.0</Text>
            <Text style={styles.infoText}>مدیریت کار و ردیابی سیگار</Text>
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
  section: {
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.glass,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: 12,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  appInfoContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.glassBorder,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
