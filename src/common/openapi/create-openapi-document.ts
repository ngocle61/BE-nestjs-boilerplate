import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';

import {
  CONTROLLER_SUFFIX,
  OPENAPI_SPEC_VERSION,
  OPENAPI_TITLE,
  OPENAPI_VERSION,
} from '../constants/openapi.constants.js';
import { zodOpenApiConverter } from './zod-openapi.converter.js';

const toOperationId = (controllerKey: string, methodKey: string): string =>
  `${controllerKey.replace(CONTROLLER_SUFFIX, '')}_${methodKey}`;

export const createOpenApiDocument = (app: INestApplication): OpenAPIObject =>
  SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setOpenAPIVersion(OPENAPI_SPEC_VERSION)
      .setTitle(OPENAPI_TITLE)
      .setVersion(OPENAPI_VERSION)
      .addBearerAuth()
      .build(),
    { standardSchemaConverter: zodOpenApiConverter, operationIdFactory: toOperationId },
  );
