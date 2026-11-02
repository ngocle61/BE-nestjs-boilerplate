# Overview

Facts only, each with its source.

## Purpose
- NestJS 12 + PostgreSQL 18 API with the data model for the calendar and chat. [README.md]

## Controllers [src/**/*.controller.ts]
- `auth`, `users`, `clients`, `interventions`, `chat`

## Rules that matter for testing [AGENTS.md, README.md]
- Every route is authenticated by default; `@Public()` opts out and `@RequirePermissions()` gates actions.
- Errors are `{ code, message, errors? }`, where `message` is a translation key.
- Access tokens last 15 minutes by default. Refresh tokens rotate on every refresh and are revoked on sign-out.
- Without `OPENAI_API_KEY`, chat requests return `503 ai_not_configured`.

## Seed data [README.md]
- 13 accounts with the demo password from README.md, 12 clients and 39 interventions. `drew.ngo@example.com` is inactive.

## How to run [README.md, src/main.ts]
- `npm run start:dev` on port 3001 under `/api`. Swagger is at `/api/docs` outside production.
