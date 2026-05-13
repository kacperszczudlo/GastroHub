import { describe, it, expect } from 'vitest';
import { getAxiosErrorPayload } from './errors';

describe('getAxiosErrorPayload', () => {
  it('returns status 0 for non-object errors', () => {
    expect(getAxiosErrorPayload(null)).toEqual({ status: 0 });
    expect(getAxiosErrorPayload('x')).toEqual({ status: 0 });
  });

  it('extracts error, details, message from axios-like response', () => {
    const payload = getAxiosErrorPayload({
      response: {
        status: 422,
        data: { error: 'Validation', details: 'Email zajęty', message: 'ignored' },
      },
      message: 'Request failed',
    });
    expect(payload).toEqual({
      status: 422,
      error: 'Validation',
      details: 'Email zajęty',
      message: 'ignored',
    });
  });

  it('falls back to top-level message when data.message missing', () => {
    const payload = getAxiosErrorPayload({
      response: { status: 500, data: { error: 'Server' } },
      message: 'Network Error',
    });
    expect(payload.message).toBe('Network Error');
  });
});
