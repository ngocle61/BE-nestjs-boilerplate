import { Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { OPENAPI_DOCS_PATH } from './common/constants/openapi.constants.js';
import { createOpenApiDocument } from './common/openapi/create-openapi-document.js';
import appConfig from './config/app.config.js';
import { NODE_ENVS } from './config/config.constants.js';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const { port, apiPrefix, corsOrigins, nodeEnv } = app.get<ConfigType<typeof appConfig>>(
    appConfig.KEY,
  );

  app.use(helmet());
  app.enableCors({ origin: corsOrigins });
  app.setGlobalPrefix(apiPrefix);
  app.enableShutdownHooks();

  if (nodeEnv !== NODE_ENVS.PRODUCTION) {
    SwaggerModule.setup(OPENAPI_DOCS_PATH, app, () => createOpenApiDocument(app), {
      useGlobalPrefix: true,
    });
  }

  await app.listen(port, '0.0.0.0');
};

try {
  await bootstrap();
} catch (error) {
  Logger.error(error instanceof Error ? error.stack : error, 'Bootstrap');
  process.exit(1);
}
