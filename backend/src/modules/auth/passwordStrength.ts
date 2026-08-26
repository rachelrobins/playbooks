/**
 * Provides password strength analysis using zxcvbn and exposes a minimum-strength
 * check for validating passwords before they are accepted by the application.
 */
import { ZxcvbnFactory, ZxcvbnResult } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const zxcvbn = new ZxcvbnFactory({
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
});

// zxcvbn scores range 0 (weakest) to 4 (strongest); below 2 is considered guessable.
const MIN_SCORE = 2;

export function checkPasswordStrength(password: string, userInputs: string[] = []): ZxcvbnResult {
  return zxcvbn.check(password, userInputs);
}

export function isPasswordStrongEnough(password: string, userInputs: string[] = []): boolean {
  return checkPasswordStrength(password, userInputs).score >= MIN_SCORE;
}
