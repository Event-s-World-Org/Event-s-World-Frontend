import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ERROR_MESSAGE,
  ERROR_MESSAGES,
  getErrorMessage,
  parseProblemDetails,
} from './error-catalog';
import { ProblemDetails } from './problem-details.model';

describe('error-catalog', () => {
  it('should return defined message for known error code', () => {
    expect(getErrorMessage('CAPACITY_EXCEEDED')).toBe(ERROR_MESSAGES['CAPACITY_EXCEEDED']);
    expect(getErrorMessage('VALIDATION_ERROR')).toBe(ERROR_MESSAGES['VALIDATION_ERROR']);
  });

  it('should return default generic Spanish message for unknown error code', () => {
    expect(getErrorMessage('COMPLETELY_UNKNOWN_ERROR_CODE')).toBe(DEFAULT_ERROR_MESSAGE);
    expect(getErrorMessage(undefined)).toBe(DEFAULT_ERROR_MESSAGE);
    expect(getErrorMessage(null)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('should return fallback detail if code is absent but detail exists', () => {
    const detail = 'Este es un mensaje específico del backend.';
    expect(getErrorMessage(null, detail)).toBe(detail);
    expect(getErrorMessage('', detail)).toBe(detail);
  });

  it('should parse ProblemDetails object into typed ApiError with translated userMessage', () => {
    const problem: ProblemDetails = {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'Bad Request',
      status: 400,
      code: 'CAPACITY_EXCEEDED',
      detail: 'The event capacity has been reached.',
    };

    const apiError = parseProblemDetails(problem, 400);

    expect(apiError.status).toBe(400);
    expect(apiError.code).toBe('CAPACITY_EXCEEDED');
    expect(apiError.userMessage).toBe(ERROR_MESSAGES['CAPACITY_EXCEEDED']);
    expect(apiError.detail).toBe('The event capacity has been reached.');
  });

  it('should parse unknown error into ApiError with default message', () => {
    const apiError = parseProblemDetails(null, 500);

    expect(apiError.status).toBe(500);
    expect(apiError.userMessage).toBe(DEFAULT_ERROR_MESSAGE);
  });
});
