import { Injectable, type ArgumentMetadata, type PipeTransform } from '@nestjs/common';
import { ZodType, type z } from 'zod';

import type { ValidationIssue } from '../dto/error-response.dto.js';
import { ValidationException } from '../exceptions/validation.exception.js';
import { toValidationIssue } from '../utils/validation-issue.util.js';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, { schema }: ArgumentMetadata): unknown {
    if (!(schema instanceof ZodType)) return value;

    const result = schema.safeParse(value, { reportInput: true });
    if (!result.success) throw new ValidationException(this.toFieldErrors(result.error));
    return result.data;
  }

  private toFieldErrors(error: z.ZodError): Record<string, ValidationIssue[]> {
    const fieldErrors: Record<string, ValidationIssue[]> = {};

    for (const issue of error.issues) {
      const [field] = issue.path;
      if (field === undefined) continue;
      (fieldErrors[String(field)] ??= []).push(toValidationIssue(issue));
    }

    return fieldErrors;
  }
}
