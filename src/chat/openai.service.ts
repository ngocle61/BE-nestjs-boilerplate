import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import openaiConfig from '../config/openai.config.js';
import { OPENAI_MAX_OUTPUT_TOKENS, SYSTEM_PROMPT } from './chat.constants.js';
import { AiNotConfiguredException } from './exceptions/ai-not-configured.exception.js';
import { AiServiceUnavailableException } from './exceptions/ai-service-unavailable.exception.js';
import type { ChatTurn } from './interfaces/chat-turn.interface.js';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly client: OpenAI | null;

  constructor(@Inject(openaiConfig.KEY) private readonly config: ConfigType<typeof openaiConfig>) {
    this.client = config.apiKey
      ? new OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl })
      : null;

    if (this.client) {
      this.logger.log(
        `AI chat uses model "${config.model}"${config.baseUrl ? ` via ${config.baseUrl}` : ''}`,
      );
    }
  }

  assertConfigured(): void {
    this.requireClient();
  }

  private requireClient(): OpenAI {
    if (!this.client) throw new AiNotConfiguredException();
    return this.client;
  }

  async *streamReply(
    history: ChatTurn[],
    context: string | undefined,
    signal: AbortSignal,
  ): AsyncGenerator<string> {
    const client = this.requireClient();

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(context
        ? [{ role: 'system' as const, content: `Context about this intervention:\n${context}` }]
        : []),
      ...history.map((turn): ChatCompletionMessageParam => ({
        role: turn.role,
        content: turn.content,
      })),
    ];

    try {
      const stream = await client.chat.completions.create(
        {
          model: this.config.model,
          messages,
          max_completion_tokens: OPENAI_MAX_OUTPUT_TOKENS,
          stream: true,
          ...(this.config.reasoningEffort ? { reasoning_effort: this.config.reasoningEffort } : {}),
        },
        { signal },
      );

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) yield delta;
      }
    } catch (error) {
      if (error instanceof OpenAI.APIUserAbortError) return;
      this.logger.error(error instanceof Error ? error.stack : error);
      throw new AiServiceUnavailableException();
    }
  }
}
