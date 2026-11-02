import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { ERROR_MESSAGE_KEYS } from '../../../src/common/constants/error-codes.constants.js';
import { VALIDATION_MESSAGE_KEYS } from '../../../src/common/constants/validation-message-keys.constants.js';

const FE_ERROR_LOCALES_URL = new URL(
  '../../../../FE-react-boilerplate/src/locale/errors/',
  import.meta.url,
);
const FE_LANGUAGES = ['en', 'vi'] as const;

const API_MESSAGE_KEYS = [
  ...Object.values(ERROR_MESSAGE_KEYS),
  ...Object.values(VALIDATION_MESSAGE_KEYS),
];

const readTranslations = (language: string): Record<string, string> =>
  JSON.parse(readFileSync(new URL(`${language}.json`, FE_ERROR_LOCALES_URL), 'utf8')) as Record<
    string,
    string
  >;

// The FE is a separate repository, so this only runs when it is checked out next to this one.
describe.skipIf(!existsSync(FE_ERROR_LOCALES_URL)).each(FE_LANGUAGES)(
  'FE "%s" error translations',
  (language) => {
    it('cover every message key the API can send', () => {
      const translations = readTranslations(language);

      expect(API_MESSAGE_KEYS.filter((key) => !(key in translations))).toEqual([]);
    });
  },
);
