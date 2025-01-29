const REALTIME_EVENT_KEYS = {
  WRITING: "writing",
  STOP_WRITING: "stop-writing",
  REVALIDATE: "revalidate",
  END_RETRO: "end-retro",
  ASSIGN_NEW_ADMIN: "assign-new-admin",
  DISCONNECT_USER: "disconnect-user",
  TIMER: "timer",
  RESET_TIMER: "reset-timer",
  SETTINGS: "settings",
  CHAT: "chat",
  CHAT_NOTIFICATION: "chat-notification",
} as const;

export default REALTIME_EVENT_KEYS;
