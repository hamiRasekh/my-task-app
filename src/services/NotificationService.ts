import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNELS } from '../utils/constants';
import { DateService } from './DateService';
import PersianDate from 'persian-date';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, string> = new Map(); // taskId -> notificationId

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Setup Android notification channels
   */
  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.TASK_REMINDER, {
      name: 'یادآوری کار',
      description: 'یادآوری برای انجام کارها',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DEADLINE_REMINDER, {
      name: 'یادآوری مهلت',
      description: 'یادآوری برای کارهای نزدیک به مهلت',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DAILY_SUMMARY, {
      name: 'خلاصه روزانه',
      description: 'خلاصه کارهای روزانه',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.CIGARETTE_WARNING, {
      name: 'هشدار سیگار',
      description: 'هشدار برای نزدیک شدن به حد مجاز سیگار',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FF231F7C',
    });
  }

  /**
   * Schedule a task reminder notification
   */
  async scheduleTaskReminder(
    taskId: string,
    title: string,
    body: string,
    date: Date,
    channelId: string = NOTIFICATION_CHANNELS.TASK_REMINDER
  ): Promise<string | null> {
    try {
      // Cancel existing notification for this task
      await this.cancelTaskNotifications(taskId);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `یادآوری: ${title}`,
          body,
          data: { taskId, type: 'task_reminder' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: date,
      });

      this.notifications.set(taskId, identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
      return null;
    }
  }

  /**
   * Schedule notification for Persian date and time
   */
  async scheduleTaskReminderPersian(
    taskId: string,
    title: string,
    body: string,
    persianDate: string,
    time?: string,
    channelId: string = NOTIFICATION_CHANNELS.TASK_REMINDER
  ): Promise<string | null> {
    try {
      // Convert Persian date to JavaScript Date
      const [year, month, day] = persianDate.split('/').map(Number);
      const persianDateObj = new PersianDate([year, month - 1, day]);
      const jsDate = persianDateObj.toDate();

      let notificationDate = new Date(jsDate);
      
      // If time is provided, set it
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        notificationDate.setHours(hours, minutes, 0, 0);
      } else {
        // Default to 9 AM
        notificationDate.setHours(9, 0, 0, 0);
      }

      // If time has passed today, schedule for the scheduled date
      const today = new Date();
      if (notificationDate < today && persianDate === DateService.getToday()) {
        // If it's today and time passed, schedule for tomorrow
        notificationDate.setDate(notificationDate.getDate() + 1);
      }

      return await this.scheduleTaskReminder(taskId, title, body, notificationDate, channelId);
    } catch (error) {
      console.error('Error scheduling Persian date notification:', error);
      return null;
    }
  }

  /**
   * Schedule deadline reminder
   */
  async scheduleDeadlineReminder(
    taskId: string,
    title: string,
    deadlineDate: string,
    channelId: string = NOTIFICATION_CHANNELS.DEADLINE_REMINDER
  ): Promise<string | null> {
    try {
      const [year, month, day] = deadlineDate.split('/').map(Number);
      const persianDateObj = new PersianDate([year, month - 1, day]);
      const jsDate = persianDateObj.toDate();
      const deadline = new Date(jsDate);
      
      // Schedule reminder one day before deadline at 8 AM
      const reminderDate = new Date(deadline);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(8, 0, 0, 0);

      if (reminderDate < new Date()) {
        return null; // Deadline is too close or passed
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `یادآوری مهلت: ${title}`,
          body: `مهلت انجام این کار فردا است`,
          data: { taskId, type: 'deadline_reminder' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: reminderDate,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling deadline reminder:', error);
      return null;
    }
  }

  /**
   * Schedule a daily notification at a specific time
   */
  async scheduleDailyNotification(
    title: string,
    body: string,
    hour: number,
    minute: number,
    channelId: string = NOTIFICATION_CHANNELS.DAILY_SUMMARY
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'daily_summary' },
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling daily notification:', error);
      return null;
    }
  }

  /**
   * Cancel a notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all notifications for a task
   */
  async cancelTaskNotifications(taskId: string): Promise<void> {
    const identifier = this.notifications.get(taskId);
    if (identifier) {
      await this.cancelNotification(identifier);
      this.notifications.delete(taskId);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notifications.clear();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

