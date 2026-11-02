import type { StandardSchemaConverter } from '@nestjs/swagger';
import { z, ZodType } from 'zod';

import {
  DATE_SCHEMA_TYPE,
  DATE_TIME_FORMAT,
  JSON_SCHEMA_TARGET,
} from '../constants/openapi.constants.js';

type JsonSchemaOverrideContext = Parameters<
  NonNullable<NonNullable<Parameters<typeof z.toJSONSchema>[1]>['override']>
>[0];

const describeDateAsString = ({ zodSchema, jsonSchema }: JsonSchemaOverrideContext): void => {
  if (zodSchema._zod.def.type !== DATE_SCHEMA_TYPE) return;
  jsonSchema.type = 'string';
  jsonSchema.format = DATE_TIME_FORMAT;
};

export const zodOpenApiConverter: StandardSchemaConverter = (schema, { schemaType }) => {
  if (!(schema instanceof ZodType)) return undefined;

  const {
    $defs,
    $schema: _dialect,
    ...root
  } = z.toJSONSchema(schema, {
    target: JSON_SCHEMA_TARGET,
    io: schemaType,
    unrepresentable: 'any',
    override: describeDateAsString,
  });

  return { schema: root, components: $defs };
};
