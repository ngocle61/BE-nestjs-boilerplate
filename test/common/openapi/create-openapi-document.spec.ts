import { readFile } from 'node:fs/promises';

import { NestFactory } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { AppModule } from '../../../src/app.module.js';
import { OPENAPI_OUTPUT_FILE } from '../../../src/common/constants/openapi.constants.js';
import { createOpenApiDocument } from '../../../src/common/openapi/create-openapi-document.js';
import appConfig from '../../../src/config/app.config.js';

describe('createOpenApiDocument', () => {
  it('matches the committed contract, so run `npm run openapi:generate` after changing a DTO', async () => {
    const app = await NestFactory.create(AppModule, {
      preview: true,
      logger: false,
      abortOnError: false,
    });
    app.setGlobalPrefix(appConfig().apiPrefix);

    const committed: unknown = JSON.parse(await readFile(OPENAPI_OUTPUT_FILE, 'utf8'));

    expect(createOpenApiDocument(app)).toEqual(committed);
    await app.close();
  });
});
