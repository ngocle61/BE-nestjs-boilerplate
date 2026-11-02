import { writeFile } from 'node:fs/promises';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { OPENAPI_JSON_INDENT, OPENAPI_OUTPUT_FILE } from './common/constants/openapi.constants.js';
import { createOpenApiDocument } from './common/openapi/create-openapi-document.js';
import appConfig from './config/app.config.js';

const app = await NestFactory.create(AppModule, {
  preview: true,
  logger: false,
  abortOnError: false,
});
app.setGlobalPrefix(appConfig().apiPrefix);

const document = createOpenApiDocument(app);
await writeFile(OPENAPI_OUTPUT_FILE, `${JSON.stringify(document, null, OPENAPI_JSON_INDENT)}\n`);
await app.close();
