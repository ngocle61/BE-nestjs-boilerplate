import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { AuthModule } from './auth/auth.module.js';
import { ChatModule } from './chat/chat.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe.js';
import appConfig from './config/app.config.js';
import authConfig from './config/auth.config.js';
import databaseConfig from './config/database.config.js';
import openaiConfig from './config/openai.config.js';
import { InterventionsModule } from './interventions/interventions.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, authConfig, databaseConfig, openaiConfig],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ClientsModule,
    InterventionsModule,
    ChatModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class AppModule {}
