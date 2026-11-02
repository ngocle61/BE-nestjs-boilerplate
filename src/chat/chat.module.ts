import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { OpenaiService } from './openai.service.js';

@Module({
  controllers: [ChatController],
  providers: [ChatService, OpenaiService],
})
export class ChatModule {}
