import { Platform } from 'react-native';

export const Config = {
  API: {
    BASE_URL: __DEV__ ? 'http://127.0.0.1:8000/api/v1' : 'https://api.scheduleapp.com/v1',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  FEATURES: {
    AI_SUGGESTIONS: true,
    OFFLINE_SUPPORT: true,
    BIOMETRIC_AUTH: Platform.OS !== 'web',
    PUSH_NOTIFICATIONS: Platform.OS !== 'web',
    ANALYTICS: !__DEV__,
    CRASH_REPORTING: !__DEV__,
  },
  
  CALENDAR: {
    DEFAULT_VIEW: 'week' as const,
    WORKING_HOURS: {
      START: '09:00',
      END: '17:00',
    },
    TIME_SLOT_DURATION: 30, // minutes
    MAX_EVENTS_PER_DAY: 20,
    SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  },
  
  NOTIFICATIONS: {
    DEFAULT_REMINDERS: ['15m', '1h', '1d'], // 15 min, 1 hour, 1 day before
    MAX_REMINDERS_PER_EVENT: 5,
    CHANNELS: {
      REMINDERS: 'reminders',
      UPDATES: 'updates',
      MARKETING: 'marketing',
    },
  },
  
  AI: {
    MAX_SUGGESTIONS: 10,
    CONFIDENCE_THRESHOLD: 0.7,
    REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes
    CHAT_HISTORY_LIMIT: 50,
  },
  
  STORAGE: {
    MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
    CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
    AUTO_CLEANUP: true,
  },
  
  PERFORMANCE: {
    LAZY_LOAD_THRESHOLD: 100,
    IMAGE_CACHE_SIZE: 100,
    LIST_ITEM_HEIGHT: 80,
    PAGINATION_SIZE: 20,
  },
  
  SECURITY: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
    BIOMETRIC_TIMEOUT: 30 * 1000, // 30 seconds
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
  
  UI: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    SKELETON_LOADING: true,
    HAPTIC_FEEDBACK: Platform.OS === 'ios',
  },
  
  DEVELOPMENT: {
    LOG_LEVEL: __DEV__ ? 'debug' : 'error',
    ENABLE_FLIPPER: __DEV__ && Platform.OS !== 'web',
    MOCK_DATA: false,
    BYPASS_AUTH: false,
  },
} as const;

export type ConfigType = typeof Config;
export type APIConfig = typeof Config.API;
export type FeatureFlags = typeof Config.FEATURES;
export type CalendarConfig = typeof Config.CALENDAR;
export type NotificationConfig = typeof Config.NOTIFICATIONS;