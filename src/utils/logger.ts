// Simple logging utility
export const isDev = import.meta.env.DEV;

// Use this instead of console.log for verbose debug messages
export const debugLog = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

// Always log errors
export const errorLog = console.error;

// Always log important info
export const infoLog = console.log;
