# BE NestJS Boilerplate

NestJS 12 + PostgreSQL 18 backend for the React boilerplate in `../FE-react-boilerplate`. It implements the API contract the FE already calls and the data model for the calendar (clients, interventions, SMS/e-mail rules) and chat (conversations, messages).

## Setup

### 1. Database

Use the PostgreSQL 18 server installed on your machine. As the `postgres` superuser, run [database/create-database.sql](./database/create-database.sql) and give the new role a password:

```sql
\i 'database/create-database.sql'
\password nestjs_boilerplate
```

`CREATEDB` lets `prisma migrate dev` create its temporary shadow database.

No local PostgreSQL? `docker compose up -d` starts `postgres:18` on port **5433** with user, password and database `nestjs_boilerplate`.

### 2. Environment

```bash
cp .env.example .env
```

Set `DATABASE_URL` and a random `JWT_ACCESS_SECRET` (at least 32 characters).

### 3. Install, migrate, seed, run

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run start:dev
```

`npm install` runs `prepare`, which installs the Git hooks. `.husky/pre-commit` runs `lint-staged` on the staged files.

The API listens on http://localhost:3001/api. The FE dev server proxies `/api` to it.

The seed is idempotent (it upserts by fixed e-mail or id, so re-running it never overwrites your edits) and creates:

- 13 accounts, all with password `Password@123`: `admin@example.com`, `member@example.com`, `viewer@example.com` plus 10 more (`jordan.pham@example.com`, `sam.huynh@example.com`, …). `drew.ngo@example.com` is inactive.
- 12 clients.
- 39 interventions: several per technician today (some overlapping), a few yesterday, tomorrow and the day after, and 5 waiting to be scheduled.

## API

Paths are relative to `/api`. Outside production, Swagger is at http://localhost:3001/api/docs, and [openapi.json](./openapi.json) holds the full contract.

| Endpoint                     | Auth              | Request                                                                                                         | Response                                                |
| :--------------------------- | :---------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| `POST /auth/sign-in`         | Public            | `{ email, password }`                                                                                           | `{ accessToken, refreshToken, user }`                   |
| `POST /auth/refresh-token`   | Public            | `{ refreshToken }`                                                                                              | `{ accessToken, refreshToken }`                         |
| `POST /auth/sign-out`        | Bearer token      | `{ refreshToken }`                                                                                              | `204`                                                   |
| `GET /users/me`              | Bearer token      | —                                                                                                               | `{ id, email, fullName, avatarUrl, role, permissions }` |
| `GET /users/technicians`     | Bearer token      | —                                                                                                               | Active users, as summaries                              |
| `GET /users`                 | `user:manage`     | Query: `page`, `pageSize`, `search`, `role`, `isActive`                                                         | `{ items, total, page, pageSize }`                      |
| `POST /users`                | `user:manage`     | `{ email, fullName, password, role }`                                                                           | `201`, the user                                         |
| `PATCH /users/:id`           | `user:manage`     | `{ fullName?, role?, isActive? }`                                                                               | The user                                                |
| `GET /clients`               | `calendar:view`   | Query: `search`                                                                                                 | Clients                                                 |
| `POST /clients`              | `calendar:manage` | `{ name, phone?, email?, addressLine?, postalCode?, city?, notes? }`                                            | `201`, the client                                       |
| `GET /interventions`         | `calendar:view`   | Query: `from`, `to`, `technicianId`, `status`, `unscheduled`, `search`                                          | Interventions                                           |
| `POST /interventions`        | `calendar:manage` | `{ clientId, type, technicianId?, startsAt?, durationMinutes, isUrgent?, notes?, callbackAt?, preferredSlot? }` | `201`, the intervention                                 |
| `GET /interventions/:id`     | `calendar:view`   | —                                                                                                               | The intervention                                        |
| `PATCH /interventions/:id`   | `calendar:manage` | The create fields, all optional, plus `status?`                                                                 | The intervention                                        |
| `DELETE /interventions/:id`  | `calendar:manage` | —                                                                                                               | `204`                                                   |
| `GET /chat/conversation`     | `chat:use`        | Query: `interventionId`                                                                                         | The conversation and its messages                       |
| `POST /chat/messages/stream` | `chat:use`        | `{ content, interventionId? }`                                                                                  | Server-sent events                                      |

Errors: `{ code, message, errors? }`, for example `401 { "code": "invalid_credentials" }` or `400 { "code": "validation_failed", "errors": { "email": ["Invalid email address"] } }`.

## AI chat

`POST /chat/messages/stream` forwards the conversation to any OpenAI-compatible chat completions API and streams the reply as server-sent events: `start`, `delta`, then `done` or `error`. Without `OPENAI_API_KEY` the app still starts and chat requests return `503 ai_not_configured`.

| Provider               | `OPENAI_API_KEY`                                         | `OPENAI_BASE_URL`                                          | `OPENAI_MODEL`     | `OPENAI_REASONING_EFFORT` |
| :--------------------- | :------------------------------------------------------- | :--------------------------------------------------------- | :----------------- | :------------------------ |
| Google Gemini (free)   | key from [AI Studio](https://aistudio.google.com/apikey) | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-3.6-flash` | `none`                    |
| OpenAI (pay as you go) | key from [OpenAI](https://platform.openai.com/api-keys)  | leave unset                                                | `gpt-4o-mini`      | leave unset               |

`OPENAI_REASONING_EFFORT` is only sent when set. `none` turns off Gemini thinking so it does not use up the reply's token budget; OpenAI models without reasoning reject the parameter, so leave it unset for them. Restart the API after changing `.env`. Google periodically retires older Gemini model names — if chat replies start failing with a `404` "no longer available" error, check [aistudio.google.com](https://aistudio.google.com) for the current recommended model and update `OPENAI_MODEL`.

## Security

- Passwords are hashed with argon2id; sign-in spends the same time whether or not the e-mail exists.
- Access tokens are short-lived JWTs (`JWT_ACCESS_TTL_SECONDS`, default 15 minutes).
- Refresh tokens are random, stored only as SHA-256 hashes, rotated on every refresh and revoked on sign-out. Reusing a rotated token revokes every session of that user.
- Every route requires a valid access token unless it is marked `@Public()`; `@RequirePermissions()` enforces the same role → permission policy as the FE.

## CI/CD

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs on pull requests into `develop` or `main` and on pushes to them:

- `verify`: formatting, `openapi.json` matches the code, `npm run verify`, and the Docker image builds.
- `e2e`: applies the migrations to an empty PostgreSQL database, seeds it and runs `npm run test:e2e`.
- `deploy`: after a push to `main` passes both, sends a `POST` to the `DEPLOY_HOOK_URL` repository secret: the deploy hook URL from your host. Without the secret the job only logs a notice. It does not run migrations, so run `npm run db:deploy` against production yourself.

The error translation test reads `src/locale/errors` from the matching branch of [FE-react-boilerplate](https://github.com/ngocle61/FE-react-boilerplate) (the branch the change targets), and skips when those files are missing.

## Scripts

| Script                     | Description                           |
| :------------------------- | :------------------------------------ |
| `npm run start:dev`        | Watch mode                            |
| `npm run build`            | Compile to `dist/`                    |
| `npm run start:prod`       | Run the compiled build                |
| `npm run typecheck`        | TypeScript 7 typecheck                |
| `npm run lint`             | oxlint                                |
| `npm run test`             | Unit tests                            |
| `npm run test:e2e`         | End-to-end tests (needs the database) |
| `npm run verify`           | Typecheck + lint + unit tests         |
| `npm run openapi:generate` | Rebuild and write `openapi.json`      |
| `npm run db:migrate`       | Create/apply migrations               |
| `npm run db:deploy`        | Apply migrations in production        |
| `npm run db:seed`          | Seed demo users and calendar data     |
| `npm run db:studio`        | Browse the data in Prisma Studio      |
