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

| Endpoint                   | Auth         | Request               | Response                                                |
| :------------------------- | :----------- | :-------------------- | :------------------------------------------------------ |
| `POST /auth/sign-in`       | Public       | `{ email, password }` | `{ accessToken, refreshToken, user }`                   |
| `POST /auth/refresh-token` | Public       | `{ refreshToken }`    | `{ accessToken, refreshToken }`                         |
| `POST /auth/sign-out`      | Bearer token | `{ refreshToken }`    | `204`                                                   |
| `GET /users/me`            | Bearer token | —                     | `{ id, email, fullName, avatarUrl, role, permissions }` |

Errors: `{ code, message, errors? }`, for example `401 { "code": "invalid_credentials" }` or `400 { "code": "validation_failed", "errors": { "email": ["Invalid email address"] } }`.

## AI chat

`POST /chat/messages` forwards the conversation to any OpenAI-compatible chat completions API. Without `OPENAI_API_KEY` the app still starts and chat requests return `503 ai_not_configured`.

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

## Scripts

| Script               | Description                           |
| :------------------- | :------------------------------------ |
| `npm run start:dev`  | Watch mode                            |
| `npm run build`      | Compile to `dist/`                    |
| `npm run start:prod` | Run the compiled build                |
| `npm run typecheck`  | TypeScript 7 typecheck                |
| `npm run lint`       | oxlint                                |
| `npm run test`       | Unit tests                            |
| `npm run test:e2e`   | End-to-end tests (needs the database) |
| `npm run verify`     | Typecheck + lint + unit tests         |
| `npm run db:migrate` | Create/apply migrations               |
| `npm run db:deploy`  | Apply migrations in production        |
| `npm run db:seed`    | Seed demo users and calendar data     |
| `npm run db:studio`  | Browse the data in Prisma Studio      |
