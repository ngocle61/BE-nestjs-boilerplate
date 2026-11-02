export const VALIDATION_MESSAGE_KEYS = {
  REQUIRED: 'fieldRequired',
  TOO_SHORT: 'fieldTooShort',
  TOO_LONG: 'fieldTooLong',
  TOO_SMALL: 'fieldTooSmall',
  TOO_BIG: 'fieldTooBig',
  INVALID_EMAIL: 'fieldInvalidEmail',
  INVALID_ID: 'fieldInvalidId',
  INVALID_DATE: 'fieldInvalidDate',
  INVALID_FORMAT: 'fieldInvalidFormat',
  INVALID_OPTION: 'fieldInvalidOption',
  INVALID_TYPE: 'fieldInvalidType',
  INVALID: 'fieldInvalid',
} as const;

export type ValidationMessageKey =
  (typeof VALIDATION_MESSAGE_KEYS)[keyof typeof VALIDATION_MESSAGE_KEYS];

export const STRING_FORMAT_MESSAGE_KEYS: Partial<Record<string, ValidationMessageKey>> = {
  email: VALIDATION_MESSAGE_KEYS.INVALID_EMAIL,
  uuid: VALIDATION_MESSAGE_KEYS.INVALID_ID,
  guid: VALIDATION_MESSAGE_KEYS.INVALID_ID,
  date: VALIDATION_MESSAGE_KEYS.INVALID_DATE,
  datetime: VALIDATION_MESSAGE_KEYS.INVALID_DATE,
};
