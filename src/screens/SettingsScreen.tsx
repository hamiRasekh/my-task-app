import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { useSettingsStore } from '../store/settingsStore';
import { ExportService } from '../services/ExportService';
import { Alert } from 'react-native';

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>تنظیمات</Text>

        {/* Notification Settings */}
        <View style={styles.section}>
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
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نمایش</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>نمایش فشرده</Text>
            <Switch
              value={settings.display.compactView}
              onValueChange={(value) => updateDisplaySettings({ compactView: value })}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        {/* Backup & Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>پشتیبان‌گیری و Export</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleBackup}>
            <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>پشتیبان‌گیری</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>Export داده‌ها</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>درباره اپ</Text>
          <Text style={styles.infoText}>نسخه: 1.0.0</Text>
          <Text style={styles.infoText}>مدیریت کار و ردیابی سیگار</Text>
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
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
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
    borderBottomColor: colors.border,
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
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    marginBottom: spacing.sm,
    gap: spacing.sm,
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
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
