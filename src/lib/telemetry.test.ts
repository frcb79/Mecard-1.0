import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOG_EVENT_NAME, type LogEntry } from './logger';
import { installTelemetryListener } from './telemetry';

type TelemetryWindow = Window & {
  __mecardTelemetryInstalled__?: boolean;
};

const buildEntry = (level: LogEntry['level']): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  scope: 'test.scope',
  message: 'test message',
});

describe('telemetry listener', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    (window as TelemetryWindow).__mecardTelemetryInstalled__ = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    (window as TelemetryWindow).__mecardTelemetryInstalled__ = undefined;
  });

  it('uses HTTP sink when VITE_TELEMETRY_ENDPOINT is configured', async () => {
    vi.stubEnv('VITE_TELEMETRY_ENDPOINT', 'https://telemetry.example/logs');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    installTelemetryListener();

    window.dispatchEvent(
      new CustomEvent<LogEntry>(LOG_EVENT_NAME, {
        detail: buildEntry('error'),
      })
    );

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://telemetry.example/logs',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('falls back to console sink and only reports error-level entries', () => {
    vi.stubEnv('VITE_TELEMETRY_ENDPOINT', '');
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    installTelemetryListener();

    window.dispatchEvent(
      new CustomEvent<LogEntry>(LOG_EVENT_NAME, {
        detail: buildEntry('warn'),
      })
    );

    expect(infoSpy).not.toHaveBeenCalled();

    window.dispatchEvent(
      new CustomEvent<LogEntry>(LOG_EVENT_NAME, {
        detail: buildEntry('error'),
      })
    );

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith(
      '[telemetry] captured error event',
      expect.objectContaining({
        scope: 'test.scope',
      })
    );
  });

  it('installs listener only once even if called multiple times', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    installTelemetryListener();
    installTelemetryListener();

    const telemetryCalls = addEventListenerSpy.mock.calls.filter(
      ([eventName]) => eventName === LOG_EVENT_NAME
    );

    expect(telemetryCalls).toHaveLength(1);
  });
});
