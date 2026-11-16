import { describe, it, expect } from 'vitest';
import {
  normalizeUsername,
  validateUsername,
  validateEmail,
  evaluatePasswordStrength,
  validateLoginForm,
  validateRegisterForm,
} from '../authValidation';

describe('authValidation utilities', () => {
  it('normalizes and validates usernames properly', () => {
    expect(normalizeUsername(' @HigorAmaral ')).toBe('higoramaral');
    expect(validateUsername('@higor_amaral').valid).toBe(true);
    expect(validateUsername('ab').valid).toBe(false);
    expect(validateUsername('nome com espaço').valid).toBe(false);
  });

  it('validates email format and required flag', () => {
    expect(validateEmail('', true).valid).toBe(false);
    expect(validateEmail('', false).valid).toBe(true);
    expect(validateEmail('invalido@').valid).toBe(false);
    expect(validateEmail('Higor@Gmail.com').normalized).toBe('higor@gmail.com');
    expect(validateEmail('Higor@Gmail.com').valid).toBe(true);
  });

  it('evaluates password strength accurately', () => {
    expect(evaluatePasswordStrength('123').score).toBe(0);
    expect(evaluatePasswordStrength('abcdef').score).toBe(1);
    expect(evaluatePasswordStrength('abc123').score).toBe(2);
    expect(evaluatePasswordStrength('Abc12345!').score).toBe(3);
  });

  it('validates login and register forms with clear error messages', () => {
    expect(validateLoginForm('', '123456')).toBeTruthy();
    expect(validateLoginForm('higoramaral', '')).toBeTruthy();
    expect(validateLoginForm('higor@gmail.com', '123456')).toBeNull();

    expect(
      validateRegisterForm({
        displayName: 'Higor',
        email: 'higor@gmail.com',
        username: 'higoramaral',
        password: 'abc',
        confirmPassword: 'abc',
      })
    ).toContain('6 caracteres');

    expect(
      validateRegisterForm({
        displayName: 'Higor',
        email: 'higor@gmail.com',
        username: 'higoramaral',
        password: 'password1',
        confirmPassword: 'password2',
      })
    ).toContain('não coincidem');

    expect(
      validateRegisterForm({
        displayName: 'Higor Amaral',
        email: 'higor@gmail.com',
        username: '@higoramaral',
        password: 'password1',
        confirmPassword: 'password1',
      })
    ).toBeNull();
  });
});
