import { HttpStatus } from '@nestjs/common';

export const ERROR_CODES = {
  BAD_REQUEST: 'bad_request',
  VALIDATION_FAILED: 'validation_failed',
  INVALID_CREDENTIALS: 'invalid_credentials',
  INVALID_REFRESH_TOKEN: 'invalid_refresh_token',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  TOO_MANY_REQUESTS: 'too_many_requests',
  HTTP_ERROR: 'http_error',
  INTERNAL: 'internal_error',
  AI_NOT_CONFIGURED: 'ai_not_configured',
  AI_SERVICE_UNAVAILABLE: 'ai_service_unavailable',
  EMAIL_ALREADY_IN_USE: 'email_already_in_use',
} as const;

export const ERROR_MESSAGE_KEYS = {
  BAD_REQUEST: 'badRequest',
  VALIDATION_FAILED: 'validationFailed',
  INVALID_CREDENTIALS: 'invalidCredentials',
  INVALID_REFRESH_TOKEN: 'invalidRefreshToken',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  FORBIDDEN_DASHBOARD_VIEW: 'forbiddenDashboardView',
  FORBIDDEN_CHAT_USE: 'forbiddenChatUse',
  FORBIDDEN_CALENDAR_VIEW: 'forbiddenCalendarView',
  FORBIDDEN_CALENDAR_MANAGE: 'forbiddenCalendarManage',
  FORBIDDEN_USER_MANAGE: 'forbiddenUserManage',
  NOT_FOUND: 'notFound',
  CONFLICT: 'conflict',
  TOO_MANY_REQUESTS: 'tooManyRequests',
  REQUEST_FAILED: 'requestFailed',
  INTERNAL: 'internal',
  CLIENT_NOT_FOUND: 'clientNotFound',
  INTERVENTION_NOT_FOUND: 'interventionNotFound',
  USER_NOT_FOUND: 'userNotFound',
  EMAIL_ALREADY_IN_USE: 'emailAlreadyInUse',
  CANNOT_MODIFY_OWN_ACCOUNT: 'cannotModifyOwnAccount',
  AI_NOT_CONFIGURED: 'aiNotConfigured',
  AI_SERVICE_UNAVAILABLE: 'aiServiceUnavailable',
} as const;

export type ErrorMessageKey = (typeof ERROR_MESSAGE_KEYS)[keyof typeof ERROR_MESSAGE_KEYS];

export const HTTP_STATUS_ERROR_CODES: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: ERROR_CODES.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ERROR_CODES.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ERROR_CODES.NOT_FOUND,
  [HttpStatus.CONFLICT]: ERROR_CODES.EMAIL_ALREADY_IN_USE,
  [HttpStatus.TOO_MANY_REQUESTS]: ERROR_CODES.TOO_MANY_REQUESTS,
};

export const HTTP_STATUS_ERROR_MESSAGE_KEYS: Partial<Record<number, ErrorMessageKey>> = {
  [HttpStatus.BAD_REQUEST]: ERROR_MESSAGE_KEYS.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ERROR_MESSAGE_KEYS.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ERROR_MESSAGE_KEYS.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ERROR_MESSAGE_KEYS.NOT_FOUND,
  [HttpStatus.CONFLICT]: ERROR_MESSAGE_KEYS.CONFLICT,
  [HttpStatus.TOO_MANY_REQUESTS]: ERROR_MESSAGE_KEYS.TOO_MANY_REQUESTS,
};
