/**
 * Simple logger utility for SafariPlus
 *
 * In production, this should be replaced with a proper logging service
 * like Pino, Winston, or a cloud logging service (e.g., Sentry, Datadog)
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Default to info in production, debug in development
const MIN_LOG_LEVEL = process.env.NODE_ENV === "production" ? "info" : "debug"

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL as LogLevel]
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ""
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLog("debug")) {
      // eslint-disable-next-line no-console
      console.log(formatMessage("debug", message, context))
    }
  },

  info(message: string, context?: LogContext) {
    if (shouldLog("info")) {
      // eslint-disable-next-line no-console
      console.log(formatMessage("info", message, context))
    }
  },

  warn(message: string, context?: LogContext) {
    if (shouldLog("warn")) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage("warn", message, context))
    }
  },

  error(message: string, error?: unknown, context?: LogContext) {
    if (shouldLog("error")) {
      const errorContext = error instanceof Error
        ? { ...context, errorMessage: error.message, errorStack: error.stack }
        : { ...context, error }
      // eslint-disable-next-line no-console
      console.error(formatMessage("error", message, errorContext))
    }
  },
}

// Named export for specific logging contexts
export function createLogger(prefix: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(`[${prefix}] ${message}`, context),
    info: (message: string, context?: LogContext) =>
      logger.info(`[${prefix}] ${message}`, context),
    warn: (message: string, context?: LogContext) =>
      logger.warn(`[${prefix}] ${message}`, context),
    error: (message: string, error?: unknown, context?: LogContext) =>
      logger.error(`[${prefix}] ${message}`, error, context),
  }
}
