import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { LOG_EVENT_NAME, logger, normalizeError } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes native errors', () => {
    const error = new Error('boom');
    const normalized = normalizeError(error);

    expect(normalized.name).toBe('Error');
    expect(normalized.message).toBe('boom');
  });

  it('logs warnings with structured payload and dispatches an event', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const entry = logger.warn('env', 'Supabase fallback enabled', {
      configured: false,
      requireSupabase: false,
    });

    expect(entry.level).toBe('warn');
    expect(entry.scope).toBe('env');
    expect(entry.context?.configured).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      '[env] Supabase fallback enabled',
      expect.objectContaining({
        level: 'warn',
        scope: 'env',
      })
    );

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0]?.[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect((event as CustomEvent).type).toBe(LOG_EVENT_NAME);
  });

  it('logs errors with normalized error details', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const entry = logger.error('auth', 'Login failed', new Error('Invalid credentials'), {
      email: 'demo@mecard.mx',
    });

    expect(entry.error?.message).toBe('Invalid credentials');
    expect(errorSpy).toHaveBeenCalledWith(
      '[auth] Login failed',
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Invalid credentials',
        }),
      })
    );
  });
});