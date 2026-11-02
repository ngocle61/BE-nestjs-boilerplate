export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_HISTORY_MESSAGES = 20;
export const OPENAI_MAX_OUTPUT_TOKENS = 600;

export const SYSTEM_PROMPT =
  'You are a helpful assistant embedded in a field-service scheduling app. Answer concisely and clearly. When context about a specific intervention is provided, use it to give relevant, practical answers.';

export const CHAT_STREAM_EVENTS = {
  START: 'start',
  DELTA: 'delta',
  DONE: 'done',
  ERROR: 'error',
} as const;

export const CHAT_STREAM_PATH = 'messages/stream';

export const EVENT_STREAM_CONTENT_TYPE = 'text/event-stream';
