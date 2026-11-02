import { describe, expect, it } from 'vitest';

import type { Message } from '../../src/generated/prisma/client.js';
import { toMessageResponse } from '../../src/chat/chat.mapper.js';

const BASE_MESSAGE: Message = {
  id: 'message-1',
  conversationId: 'conversation-1',
  senderId: 'user-1',
  body: 'Hello',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  editedAt: null,
};

describe('toMessageResponse', () => {
  it('marks a message with a sender as not from the assistant', () => {
    expect(toMessageResponse(BASE_MESSAGE).isAssistant).toBe(false);
  });

  it('marks a message without a sender as from the assistant', () => {
    expect(toMessageResponse({ ...BASE_MESSAGE, senderId: null }).isAssistant).toBe(true);
  });
});
