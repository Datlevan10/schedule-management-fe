import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Vibration } from 'react-native';
import { NotificationAPI } from '../api/notifications.api';

export interface TaskReminder {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  dueDateTime: string;
  reminderTime: string;
  priority: 'thấp' | 'trung bình' | 'cao' | 'rất cao';
  isActive: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private reminders: TaskReminder[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadReminders();
    this.startReminderCheck();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Load reminders from AsyncStorage
  private async loadReminders() {
    try {
      const stored = await AsyncStorage.getItem('taskReminders');
      if (stored) {
        this.reminders = JSON.parse(stored);
        console.log('📋 Loaded reminders:', this.reminders.length);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }

  // Save reminders to AsyncStorage
  private async saveReminders() {
    try {
      await AsyncStorage.setItem('taskReminders', JSON.stringify(this.reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }

  // Add a new task reminder
  async addTaskReminder(reminder: Omit<TaskReminder, 'id' | 'isActive'>): Promise<void> {
    const newReminder: TaskReminder = {
      ...reminder,
      id: `reminder_${Date.now()}_${reminder.taskId}`,
      isActive: true
    };

    this.reminders.push(newReminder);
    await this.saveReminders();
    console.log('➕ Added reminder for task:', reminder.title);
  }

  // Remove a task reminder
  async removeTaskReminder(reminderId: string): Promise<void> {
    this.reminders = this.reminders.filter(r => r.id !== reminderId);
    await this.saveReminders();
    console.log('➖ Removed reminder:', reminderId);
  }

  // Generate reminders for upcoming tasks (within next 24 hours)
  async generateTaskReminders(userId: number): Promise<void> {
    try {
      // Get latest priority recommendations
      const priorityData = await NotificationAPI.getLatestTaskPriorityRecommendations(userId);
      
      if (!priorityData?.data?.priority_ranking) {
        return;
      }

      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Generate reminders for high-priority tasks due within 24 hours
      for (const task of priorityData.data.priority_ranking) {
        const taskDate = new Date(task.start_datetime);
        
        if (taskDate > now && taskDate <= next24Hours) {
          // Calculate reminder times based on priority
          const reminderTimes = this.calculateReminderTimes(task.urgency_level, taskDate);
          
          for (const reminderTime of reminderTimes) {
            // Check if reminder already exists
            const exists = this.reminders.some(r => 
              r.taskId === task.task_id && 
              r.reminderTime === reminderTime.toISOString()
            );

            if (!exists) {
              await this.addTaskReminder({
                taskId: task.task_id,
                title: task.title,
                description: `${task.priority_description || ''} - ${task.location}`,
                dueDateTime: task.start_datetime,
                reminderTime: reminderTime.toISOString(),
                priority: this.mapUrgencyToPriority(task.urgency_level)
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating task reminders:', error);
    }
  }

  // Calculate reminder times based on task urgency
  private calculateReminderTimes(urgencyLevel: string, dueDate: Date): Date[] {
    const reminderTimes: Date[] = [];
    
    switch (urgencyLevel) {
      case 'critical':
        // 2 hours before, 1 hour before, 30 minutes before, 10 minutes before
        reminderTimes.push(new Date(dueDate.getTime() - 2 * 60 * 60 * 1000));
        reminderTimes.push(new Date(dueDate.getTime() - 1 * 60 * 60 * 1000));
        reminderTimes.push(new Date(dueDate.getTime() - 30 * 60 * 1000));
        reminderTimes.push(new Date(dueDate.getTime() - 10 * 60 * 1000));
        break;
      case 'high':
        // 2 hours before, 30 minutes before
        reminderTimes.push(new Date(dueDate.getTime() - 2 * 60 * 60 * 1000));
        reminderTimes.push(new Date(dueDate.getTime() - 30 * 60 * 1000));
        break;
      case 'medium':
        // 1 hour before
        reminderTimes.push(new Date(dueDate.getTime() - 1 * 60 * 60 * 1000));
        break;
      case 'low':
        // 2 hours before
        reminderTimes.push(new Date(dueDate.getTime() - 2 * 60 * 60 * 1000));
        break;
    }

    // Filter out past times
    const now = new Date();
    return reminderTimes.filter(time => time > now);
  }

  // Map urgency level to priority
  private mapUrgencyToPriority(urgency: string): 'thấp' | 'trung bình' | 'cao' | 'rất cao' {
    switch (urgency) {
      case 'critical': return 'rất cao';
      case 'high': return 'cao';
      case 'medium': return 'trung bình';
      case 'low': return 'thấp';
      default: return 'trung bình';
    }
  }

  // Start checking for due reminders
  private startReminderCheck() {
    // Check every minute for due reminders
    this.checkInterval = setInterval(() => {
      this.checkDueReminders();
    }, 60000); // 60 seconds
  }

  // Check for reminders that are due
  private async checkDueReminders() {
    const now = new Date();
    const dueReminders = this.reminders.filter(reminder => 
      reminder.isActive && new Date(reminder.reminderTime) <= now
    );

    for (const reminder of dueReminders) {
      await this.triggerReminder(reminder);
      
      // Mark reminder as triggered
      reminder.isActive = false;
    }

    if (dueReminders.length > 0) {
      await this.saveReminders();
    }
  }

  // Trigger a reminder notification
  private async triggerReminder(reminder: TaskReminder) {
    const timeUntilDue = new Date(reminder.dueDateTime).getTime() - new Date().getTime();
    const minutesUntil = Math.round(timeUntilDue / (1000 * 60));
    
    let message = `📅 ${reminder.title}`;
    if (minutesUntil > 0) {
      message += `\n⏰ Bắt đầu trong ${this.formatTimeUntil(minutesUntil)}`;
    } else {
      message += `\n🔥 Đã đến thời gian thực hiện!`;
    }

    if (reminder.description) {
      message += `\n📝 ${reminder.description}`;
    }

    // Vibrate based on priority
    this.vibrateForPriority(reminder.priority);

    // Show alert notification
    Alert.alert(
      `🔔 Nhắc nhở: ${this.getPriorityEmoji(reminder.priority)}`,
      message,
      [
        { 
          text: 'Tắt', 
          style: 'cancel' 
        },
        { 
          text: 'Xem thông báo',
          onPress: () => {
            // Navigate to notifications (would need to be handled by the calling component)
          }
        }
      ]
    );

    // Store notification flag for UI update
    await AsyncStorage.setItem('newNotificationAvailable', 'true');
    
    console.log('🔔 Triggered reminder:', reminder.title);
  }

  // Format time until due
  private formatTimeUntil(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} giờ`;
      } else {
        return `${hours} giờ ${remainingMinutes} phút`;
      }
    }
  }

  // Get priority emoji
  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'rất cao': return '🔥';
      case 'cao': return '⭐';
      case 'trung bình': return '📝';
      case 'thấp': return '📌';
      default: return '📝';
    }
  }

  // Vibrate based on priority level
  private vibrateForPriority(priority: string) {
    switch (priority) {
      case 'rất cao':
        // Strong vibration pattern for critical
        Vibration.vibrate([0, 200, 100, 200, 100, 200]);
        break;
      case 'cao':
        // Medium vibration pattern for high
        Vibration.vibrate([0, 150, 100, 150]);
        break;
      case 'trung bình':
        // Light vibration pattern for medium
        Vibration.vibrate([0, 100]);
        break;
      case 'thấp':
        // Very light vibration for low
        Vibration.vibrate(50);
        break;
    }
  }

  // Clean up
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  // Get active reminders for debugging
  getActiveReminders(): TaskReminder[] {
    return this.reminders.filter(r => r.isActive);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();