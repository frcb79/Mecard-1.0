import { LOG_EVENT_NAME, type LogEntry } from './logger';

type TelemetrySink = (entry: LogEntry) => void;

type WindowWithTelemetryFlag = Window & {
  __mecardTelemetryInstalled__?: boolean;
};

const createConsoleSink = (): TelemetrySink => {
  return (entry) => {
    if (entry.level !== 'error') {
      return;
    }

    // Keep fallback sink lightweight and non-blocking for local diagnostics.
    console.info('[telemetry] captured error event', {
      scope: entry.scope,
      message: entry.message,
      timestamp: entry.timestamp,
    });
  };
};

const createHttpSink = (endpoint: string): TelemetrySink => {
  return (entry) => {
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      keepalive: true,
    }).catch(() => {
      // Keep telemetry fire-and-forget to avoid UI side effects.
    });
  };
};

const resolveSink = (): TelemetrySink => {
  const endpoint = (import.meta.env.VITE_TELEMETRY_ENDPOINT ?? '').trim();
  if (endpoint.length > 0) {
    return createHttpSink(endpoint);
  }

  return createConsoleSink();
};

export const installTelemetryListener = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const flaggedWindow = window as WindowWithTelemetryFlag;
  if (flaggedWindow.__mecardTelemetryInstalled__) {
    return;
  }

  const sink = resolveSink();

  window.addEventListener(LOG_EVENT_NAME, (event: Event) => {
    const customEvent = event as CustomEvent<LogEntry>;
    if (!customEvent.detail) {
      return;
    }

    sink(customEvent.detail);
  });

  flaggedWindow.__mecardTelemetryInstalled__ = true;
};
