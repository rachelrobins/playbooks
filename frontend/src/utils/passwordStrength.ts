import { ZxcvbnFactory, ZxcvbnResult } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

// uses zxcvbn lib to harden password strength requirements and prevent weak passwords from being used

const zxcvbn = new ZxcvbnFactory({
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
});

// zxcvbn scores range 0 (weakest) to 4 (strongest); below 2 is considered guessable.
// Kept in sync with backend/src/modules/auth/passwordStrength.ts.
export const MIN_PASSWORD_SCORE = 2;

export function checkPasswordStrength(password: string, userInputs: string[] = []): ZxcvbnResult {
  return zxcvbn.check(password, userInputs);
}

export function isPasswordStrongEnough(password: string, userInputs: string[] = []): boolean {
  if (!password) return false;
  return checkPasswordStrength(password, userInputs).score >= MIN_PASSWORD_SCORE;
}
