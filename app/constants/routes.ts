export const Routes = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  MAIN: {
    TABS: "/(tabs)",
    SCHEDULE: "/(tabs)/schedule",
    AI: "/(tabs)/ai",
    REPORTS: "/(tabs)/reports",
    PROFILE: "/(tabs)/profile",
  },

  SCHEDULE: {
    LIST: "/schedule",
    ADD: "/schedule/add",
    EDIT: "/schedule/edit/[id]",
    DETAIL: "/schedule/[id]",
  },

  AI: {
    SUGGESTIONS: "/ai/suggestions",
    CHAT: "/ai/chat",
  },

  REPORTS: {
    OVERVIEW: "/reports",
    TIME_USAGE: "/reports/time-usage",
    PRODUCTIVITY: "/reports/productivity",
    ACTIVITY: "/reports/activity",
  },

  PROFILE: {
    MAIN: "/profile",
    EDIT: "/profile/edit",
    SETTINGS: "/profile/settings",
    REMINDERS: "/profile/reminders",
  },

  ONBOARDING: {
    WELCOME: "/onboarding/welcome",
  },

  MODAL: {
    EVENT_FORM: "/modal/event-form",
    AI_SUGGESTION: "/modal/ai-suggestion",
    REMINDER_SETTINGS: "/modal/reminder-settings",
  },
} as const;

export type RouteKeys = keyof typeof Routes;
export type AuthRoutes = keyof typeof Routes.AUTH;
export type MainRoutes = keyof typeof Routes.MAIN;
export type ScheduleRoutes = keyof typeof Routes.SCHEDULE;
export type AIRoutes = keyof typeof Routes.AI;
export type ReportRoutes = keyof typeof Routes.REPORTS;
export type ProfileRoutes = keyof typeof Routes.PROFILE;
