export const StorageKeys = {
  AUTH: {
    TOKEN: '@auth_token',
    REFRESH_TOKEN: '@refresh_token',
    USER_DATA: '@user_data',
    BIOMETRIC_ENABLED: '@biometric_enabled',
  },
  
  USER: {
    PREFERENCES: '@user_preferences',
    SETTINGS: '@user_settings',
    THEME: '@user_theme',
    LANGUAGE: '@user_language',
    TIMEZONE: '@user_timezone',
    FIRST_LAUNCH: '@first_launch',
  },
  
  SCHEDULE: {
    CACHED_EVENTS: '@cached_events',
    LAST_SYNC: '@last_sync',
    VIEW_PREFERENCES: '@view_preferences',
    CALENDAR_SETTINGS: '@calendar_settings',
  },
  
  AI: {
    SUGGESTIONS_CACHE: '@ai_suggestions_cache',
    CHAT_HISTORY: '@ai_chat_history',
    PREFERENCES: '@ai_preferences',
    DISMISSED_SUGGESTIONS: '@dismissed_suggestions',
  },
  
  NOTIFICATIONS: {
    SETTINGS: '@notification_settings',
    PERMISSION_ASKED: '@notification_permission_asked',
    DEVICE_TOKEN: '@device_token',
    SCHEDULED_REMINDERS: '@scheduled_reminders',
  },
  
  OFFLINE: {
    PENDING_REQUESTS: '@pending_requests',
    CACHED_DATA: '@cached_data',
    LAST_ONLINE: '@last_online',
  },
  
  ANALYTICS: {
    USER_ID: '@analytics_user_id',
    SESSION_COUNT: '@session_count',
    LAST_SESSION: '@last_session',
    USAGE_STATS: '@usage_stats',
  },
  
  ONBOARDING: {
    COMPLETED: '@onboarding_completed',
    STEP: '@onboarding_step',
    SKIPPED: '@onboarding_skipped',
  },
  
  DEVELOPMENT: {
    DEBUG_MODE: '@debug_mode',
    API_BASE_URL: '@api_base_url',
    FEATURE_FLAGS: '@feature_flags',
  },
} as const;

export type StorageKeyType = typeof StorageKeys;
export type AuthStorageKeys = keyof typeof StorageKeys.AUTH;
export type UserStorageKeys = keyof typeof StorageKeys.USER;
export type ScheduleStorageKeys = keyof typeof StorageKeys.SCHEDULE;
export type AIStorageKeys = keyof typeof StorageKeys.AI;
export type NotificationStorageKeys = keyof typeof StorageKeys.NOTIFICATIONS;