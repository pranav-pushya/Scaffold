/**
 * captchaUtils.js
 * Pure utility functions for the login math captcha (Security Check).
 * Extracted here so they can be unit-tested without importing the Login
 * component (which pulls in Firebase, CSS, and React Router).
 */

/**
 * Generates a random two-operand addition captcha.
 * Both operands are in [1, 9] so the expected answer is in [2, 18].
 *
 * @returns {{ num1: number, num2: number, expected: number }}
 */
export function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return { num1, num2, expected: num1 + num2 };
}

/**
 * Validates a user-supplied answer string against a captcha object.
 *
 * @param {string|number} answer - The value the user typed in the input.
 * @param {{ expected: number }} captcha - The active captcha object.
 * @returns {boolean} true if the answer matches.
 */
export function validateCaptcha(answer, captcha) {
  return parseInt(answer, 10) === captcha.expected;
}
