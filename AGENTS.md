# Agent Guide (BE)

NestJS 12 API for the React boilerplate in `../FE-react-boilerplate`. Run every command from the repository root. The code follows the structure and naming conventions of the official NestJS documentation.

Stories to implement live in `user-story/`. When given one, follow the workflow in [user-story/README.md](./user-story/README.md): requirement, analyze, Figma when linked, implement, QA, result.

## Stack

Node 24 · NestJS 12 (ESM, `nodenext`) · TypeScript 7 (`tsc`, with the TypeScript 6 API kept for the Nest CLI) · Prisma ORM 7 + `@prisma/adapter-pg` · PostgreSQL 18 · Zod 4 · argon2 · JWT access tokens + rotating refresh tokens · Vitest · oxlint

## Commands

| Command                    | Purpose                                                                            |
| :------------------------- | :--------------------------------------------------------------------------------- |
| `npm run start:dev`        | API on http://localhost:3001/api with watch mode                                   |
| `npm run verify`           | Typecheck + lint + unit tests                                                      |
| `npm run openapi:generate` | Build and write `openapi.json`, the contract the FE generates its Zod schemas from |
| `npm run test:e2e`         | End-to-end tests against the database in `.env`                                    |
| `npm run db:migrate`       | Create/apply a migration from `prisma/schema.prisma`                               |
| `npm run db:seed`          | Upsert the demo accounts used by the FE                                            |

## Structure

```text
src/
├── main.ts                     bootstrap: helmet, CORS, global prefix, shutdown hooks, Swagger UI (non-production)
├── openapi.ts                  writes openapi.json (`npm run openapi:generate`)
├── app.module.ts               root module: ConfigModule, PrismaModule, feature modules, global filter and pipe
├── config/                     registerAs() namespaces validated with Zod (app, auth, database)
├── common/                     cross-cutting building blocks, no business logic
│   ├── constants/              error codes, error and validation message keys, OpenAPI settings
│   ├── dto/                    ErrorResponse and ValidationIssue schemas
│   ├── exceptions/             ApiException and shared subclasses
│   ├── filters/                AllExceptionsFilter → { code, message, errors? }
│   ├── openapi/                Zod → OpenAPI converter, createOpenApiDocument()
│   ├── pipes/                  ZodValidationPipe (global, reads the schema from @Body/@Query)
│   └── utils/                  Zod issue → validation message key
├── prisma/                     PrismaModule (global) + PrismaService
├── auth/                       feature module
│   ├── auth.module.ts  auth.controller.ts  auth.service.ts  token.service.ts  password.service.ts
│   ├── auth.constants.ts
│   ├── decorators/             @Public(), @RequirePermissions(), @CurrentUser()
│   ├── dto/                    Zod schema + inferred type per request and per response
│   ├── exceptions/
│   ├── guards/                 JwtAuthGuard, PermissionsGuard (registered as APP_GUARD)
│   ├── openapi/                Zod → OpenAPI converter, createOpenApiDocument()
│   ├── permissions/            PERMISSIONS, ROLE_PERMISSIONS and helpers
│   └── utils/
├── users/                      feature module: users.module/controller/service, users.mapper.ts, dto/
└── generated/prisma/           Prisma client output (git-ignored, never edited)
prisma/                         schema.prisma, migrations/, seed.ts, seed-data.ts
test/
├── *.e2e-spec.ts               end-to-end specs against the database
└── users/ auth/ chat/ …        unit specs mirroring src/ (test/users/users.controller.spec.ts)
```

## Conventions

- One feature module per folder directly under `src/` (`auth/`, `users/`, later `interventions/`, `chat/`). Generate new pieces with `npx nest g module|controller|service <name>` and keep the Nest suffixes: `.module.ts`, `.controller.ts`, `.service.ts`, `.guard.ts`, `.decorator.ts`, `.filter.ts`, `.pipe.ts`, `.exception.ts`, `.interface.ts`, `.dto.ts`, `.constants.ts`, `.mapper.ts`.
- Controllers stay thin: validate input, read `@CurrentUser()`, call a service. Business logic lives in services; database access goes through `PrismaService`.
- A module that needs another feature imports that module and uses its exported service (for example `AuthModule` imports `UsersModule`).
- Request DTOs are Zod schemas with `export type XxxDto = z.infer<typeof xxxSchema>`, declared on the parameter with `@Body({ schema: xxxSchema })` / `@Query({ schema: xxxQuerySchema })`. The global `ZodValidationPipe` (`APP_PIPE`) validates every parameter that declares a Zod schema, and Swagger reads the same schema, so one declaration validates and documents. Import DTO types with `import type` (required by `isolatedModules` + `emitDecoratorMetadata`).
- Response DTOs are Zod schemas too, named with `.meta({ id: 'XxxResponse' })` so they become `components.schemas` entries, and documented with `@ApiOkResponse({ standardSchema: xxxResponseSchema })` (`@ApiCreatedResponse`, `@ApiNoContentResponse` for the other statuses). Dates are `z.date()` (documented as `date-time` strings); ids are `z.string()`. Every controller also declares `@ApiDefaultResponse({ standardSchema: errorResponseSchema })`, and `@ApiBearerAuth()` unless the route is `@Public()`.
- The OpenAPI 3.1 document is the FE contract. After changing any DTO run `npm run openapi:generate` and commit `openapi.json`; `test/common/openapi/create-openapi-document.spec.ts` fails while it is stale. Swagger UI is served at `/api/docs` outside production.
- Read configuration by injecting a namespace: `@Inject(authConfig.KEY) auth: ConfigType<typeof authConfig>`. Never read `process.env` outside `src/config`.
- Every route is authenticated by default. Opt out with `@Public()`; gate actions with `@RequirePermissions(PERMISSIONS.X)`. Roles and permissions must stay identical to `../FE-react-boilerplate/src/core/constants`.
- Errors leave the API as `{ code, message, errors? }`, where `message` is a translation key from `ERROR_MESSAGE_KEYS`, never user-facing text. The FE translates it with `../FE-react-boilerplate/src/locale/errors/*.json`, so every key added here needs an entry there. Throw Nest built-in exceptions with a key (`new ForbiddenException(ERROR_MESSAGE_KEYS.FORBIDDEN)`) or a domain subclass of `ApiException` when the client needs a specific `code`; `AllExceptionsFilter` replaces any message that is not a known key with the key for the HTTP status. Validation errors list `{ key, params? }` issues per field, keyed from `VALIDATION_MESSAGE_KEYS` by `ZodValidationPipe`, and a 403 carries the key of the missing permission (`PERMISSION_FORBIDDEN_MESSAGE_KEYS`). `test/common/constants/error-message-keys.spec.ts` fails when a key has no FE translation.
- ESM: relative imports end with `.js`. Import the Prisma client from `src/generated/prisma/client.js` and enums from `enums.js`.
- Never put a spec next to the file it tests. Unit specs mirror the source path under `test/` (`src/users/users.controller.ts` → `test/users/users.controller.spec.ts`) and import the code relatively (`../../src/users/users.controller.js`); end-to-end specs are `test/*.e2e-spec.ts`. `nest g` is configured not to generate co-located specs.
- Run `npm run verify` before finishing; run `npm run test:e2e` when auth, guards, config or the schema change.
