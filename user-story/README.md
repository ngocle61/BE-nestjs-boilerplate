# User Stories

Put the stories to implement here, one Markdown file per story, named `<id>-<short-title>.md` (for example `123-export-users-api.md`). Then start the workflow:

```text
/implement-story user-story/123-export-users-api.md
```

Agents without that command can be told `Implement user-story/123-export-users-api.md`. Both follow [the workflow](#workflow) below.

A feature that needs both sides gets two stories: this one for the API, and an `[FE]` one in [FE-react-boilerplate](https://github.com/ngocle61/FE-react-boilerplate). Do the BE story first, because the FE generates its contract from `openapi.json`.

## Story format

Only the title and acceptance criteria are required. Paste the rest as you have it.

```md
# [BE] Export users to CSV

As an admin, I want an endpoint that exports the user list, so that the Users screen can download it.

Figma: https://www.figma.com/design/<file-key>/<name>?node-id=<node-id>

## Acceptance criteria

- `GET /users/export` returns the users that match the same filters as `GET /users`.
- It requires the `user:manage` permission.

## Notes

Links, data rules, anything out of scope.
```

- The `[BE]` prefix tells QA this is backend work, so it does not have to ask.
- The `Figma:` line is optional. The API has no screens, so add it only when the design decides which data the API must return.

## Workflow

Requirement → analyze → Figma (when linked) → implement → QA → result.

The agent stops and asks you only at the points marked **Stop**.

### 1. Requirement

Read the story and [AGENTS.md](../AGENTS.md).

**Stop** if the story has no acceptance criteria.

### 2. Analyze

Write a short analysis in the chat, not in the story file:

- each acceptance criterion, in testable terms
- the endpoints, request and response schemas involved
- the permissions involved
- any database change
- what the FE calls today, checked in `../FE-react-boilerplate/src/core/apis`

**Stop** if a criterion is ambiguous or two of them conflict. Do not guess.

### 3. Figma

Skip this step when the story has no `Figma:` link. The BE never drafts designs.

Figma reads are limited (20 a month on the Starter plan), so read only the frames the story needs, once each, to learn which data they show. If Figma refuses a read, **stop** and report it.

### 4. Implement

- Follow [AGENTS.md](../AGENTS.md). The story decides behavior.
- **Stop** if the design needs data the story rules out.
- Add unit tests, and run `npm run verify` until it passes.
- Run `npm run openapi:generate` when the contract changes, and tell the user the FE must run `npm run api:generate`.
- **Stop** before any command that writes to the database: `npm run db:migrate`, `npm run db:deploy`, `npm run db:seed` or `npm run test:e2e`. `.env` may point at a shared database, so show its host and ask. CI runs migrations and end-to-end tests on its own empty database.

### 5. QA

The API must be running, and QA never starts it.

1. Check that http://localhost:3001/api/docs answers.
2. **Stop** if it does not, and give the user the start command: `npm run start:dev`.
3. **Stop** when the story involves more than one role, and ask for the accounts (see [how-to-test](../.qa/how-to-test.md)).
4. Sign in with `POST /auth/sign-in` and store the access token as `API_TOKEN` in `.qa/secrets.env`, without printing it. It expires after 15 minutes by default.
5. Run the `qa-agent` skill on the story and tell it to run QA now. It asks before each scenario that writes data.

If a criterion fails, fix it, run `npm run verify` again and rerun QA, at most twice. After that, report what still fails.

### 6. Result

Report to the user:

- each acceptance criterion as PASS, FAIL or PENDING, with its evidence
- anything still PENDING or NOT COVERED
- the files changed, and the `npm run verify` result
- whether the contract changed, and any migration still to apply

Do not commit or push unless asked. When asked, push to `develop` with a `Feat :: `, `Chore :: ` or `Wip :: ` subject.
