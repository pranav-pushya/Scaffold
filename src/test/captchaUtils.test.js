/**
 * Unit tests for captchaUtils.js
 *
 * These are pure-function tests — no DOM, no React, no Firebase.
 * They verify the captcha generator's contracts so that any
 * accidental logic change (e.g. operand range, expected value) is
 * caught immediately.
 *
 * CLO06 scope: unit testing a pure utility function.
 */

import { describe, it, expect } from 'vitest';
import { generateCaptcha, validateCaptcha } from '../utils/captchaUtils.js';

describe('generateCaptcha()', () => {
  it('returns an object with num1, num2, and expected properties', () => {
    const captcha = generateCaptcha();
    expect(captcha).toHaveProperty('num1');
    expect(captcha).toHaveProperty('num2');
    expect(captcha).toHaveProperty('expected');
  });

  it('num1 is an integer between 1 and 9 (inclusive)', () => {
    // Run multiple times to catch edge-case randomness
    for (let i = 0; i < 50; i++) {
      const { num1 } = generateCaptcha();
      expect(num1).toBeGreaterThanOrEqual(1);
      expect(num1).toBeLessThanOrEqual(9);
      expect(Number.isInteger(num1)).toBe(true);
    }
  });

  it('num2 is an integer between 1 and 9 (inclusive)', () => {
    for (let i = 0; i < 50; i++) {
      const { num2 } = generateCaptcha();
      expect(num2).toBeGreaterThanOrEqual(1);
      expect(num2).toBeLessThanOrEqual(9);
      expect(Number.isInteger(num2)).toBe(true);
    }
  });

  it('expected equals num1 + num2', () => {
    for (let i = 0; i < 50; i++) {
      const { num1, num2, expected } = generateCaptcha();
      expect(expected).toBe(num1 + num2);
    }
  });

  it('expected is in the range [2, 18]', () => {
    for (let i = 0; i < 100; i++) {
      const { expected } = generateCaptcha();
      expect(expected).toBeGreaterThanOrEqual(2);
      expect(expected).toBeLessThanOrEqual(18);
    }
  });
});

describe('validateCaptcha()', () => {
  it('returns true when the answer matches expected', () => {
    const captcha = { num1: 3, num2: 4, expected: 7 };
    expect(validateCaptcha('7', captcha)).toBe(true);
    expect(validateCaptcha(7, captcha)).toBe(true);
  });

  it('returns false when the answer is wrong', () => {
    const captcha = { num1: 3, num2: 4, expected: 7 };
    expect(validateCaptcha('8', captcha)).toBe(false);
    expect(validateCaptcha(0, captcha)).toBe(false);
  });

  it('returns false for an empty string answer', () => {
    const captcha = { num1: 1, num2: 1, expected: 2 };
    expect(validateCaptcha('', captcha)).toBe(false);
  });

  it('returns false for a non-numeric string', () => {
    const captcha = { num1: 2, num2: 2, expected: 4 };
    expect(validateCaptcha('abc', captcha)).toBe(false);
  });
});
