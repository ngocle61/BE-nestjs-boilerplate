# Terms defined in the docs

- **What that means for a QA run**: - Follow the user story (US) first: its acceptance criteria decide what to test and what counts as correct.  [.qa\how-to-test.md]
- **Errors**: `{ code, message, errors? }`, for example `401 { "code": "invalid_credentials" }` or `400 { "code": "validation_failed", "errors": { "email": ["Invalid email address"] } }`.  [README.md]
