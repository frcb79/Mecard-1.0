export type LogValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | LogValue[]
  | { [key: string]: LogValue };

export type LogContext = Record<string, LogValue>;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type NormalizedError = {
  name: string;
  message: string;
  stack?: string;
};

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  context?: LogContext;
  error?: NormalizedError;
};

export const LOG_EVENT_NAME = 'mecard:log';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const normalizeError = (error: unknown): NormalizedError => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
    };
  }

  if (isRecord(error) && typeof error.message === 'string') {
    return {
      name: typeof error.name === 'string' ? error.name : 'Error',
      message: error.message,
      stack: typeof error.stack === 'string' ? error.stack : undefined,
    };
  }

  return {
    name: 'UnknownError',
    message: 'An unknown error occurred.',
  };
};

const emitLogEvent = (entry: LogEntry) => {
  if (
    typeof window === 'undefined' ||
    typeof window.dispatchEvent !== 'function' ||
    typeof CustomEvent === 'undefined'
  ) {
    return;
  }

  window.dispatchEvent(new CustomEvent<LogEntry>(LOG_EVENT_NAME, { detail: entry }));
};

const writeToConsole = (entry: LogEntry) => {
  const prefix = `[${entry.scope}] ${entry.message}`;

  switch (entry.level) {
    case 'debug':
      console.debug(prefix, entry);
      break;
    case 'info':
      console.info(prefix, entry);
      break;
    case 'warn':
      console.warn(prefix, entry);
      break;
    case 'error':
      console.error(prefix, entry);
      break;
  }
};

export const logEvent = (
  level: LogLevel,
  scope: string,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry => {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    ...(context ? { context } : {}),
    ...(typeof error !== 'undefined' ? { error: normalizeError(error) } : {}),
  };

  writeToConsole(entry);
  emitLogEvent(entry);

  return entry;
};

export const logger = {
  debug: (scope: string, message: string, context?: LogContext) =>
    logEvent('debug', scope, message, context),
  info: (scope: string, message: string, context?: LogContext) =>
    logEvent('info', scope, message, context),
  warn: (scope: string, message: string, context?: LogContext) =>
    logEvent('warn', scope, message, context),
  error: (scope: string, message: string, error: unknown, context?: LogContext) =>
    logEvent('error', scope, message, context, error),
};