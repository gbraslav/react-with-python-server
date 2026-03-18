# Spec for Neon Database Connection

branch: claude/feature/neon-database

## Summary
Connect the Flask backend to a Neon Serverless Postgres database called `python_server`. Replace all hardcoded and temporary in-memory data (currently the `CHART_DATA` list in `server/app.py`) with queries against the database. After this feature, the server should have zero hardcoded dataset definitions — all data is read from and managed in Neon.

## Functional Requirements
- Connect the Flask app to the Neon `python_server` database using a connection string stored in an environment variable (e.g. `DATABASE_URL`)
- Create a `chart_data` table in Neon that mirrors the current `CHART_DATA` structure (id, month, data_field1–4)
- Seed the `chart_data` table with the same 25 rows currently hardcoded in `app.py`
- Update the `/api/chart-data` endpoint to query the database instead of returning the in-memory list
- Remove the hardcoded `CHART_DATA` list from `app.py`
- Add `psycopg2-binary` (or equivalent Postgres driver) to `server/requirements.txt`
- Store the Neon connection string via a `.env` file (gitignored) and document the required env var
- The `/api/hello` endpoint remains unchanged (it has no hardcoded data)

## Possible Edge Cases
- Database is unreachable — API should return a clear error response, not crash
- Connection string is missing from environment — app should fail fast on startup with a helpful message
- Empty table — `/api/chart-data` should return an empty array, not error
- Connection pooling — ensure connections are properly managed and not leaked

## Acceptance Criteria
- The Flask app connects to Neon on startup and the `/api/chart-data` endpoint returns the same JSON shape as before
- No hardcoded dataset arrays remain in `app.py`
- A seed script or migration exists to populate the `chart_data` table
- The connection string is read from an environment variable, not hardcoded
- `.env` is listed in `.gitignore`
- `requirements.txt` includes the new database dependencies
- The frontend dashboard continues to work identically with no changes required

## Open Questions
- Should we use an ORM (e.g. SQLAlchemy) or keep it simple with raw SQL via psycopg2? use ORM
- Do we need a migration tool (e.g. Alembic) or is a simple seed script sufficient for now? no create new data, 50 rows
- Should we add a `/api/health` endpoint that checks DB connectivity? yes

# Testing Guidelines
Create a test file(s) in the ./test folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Database connection is established successfully
- `/api/chart-data` returns the expected JSON structure from the database
- `/api/chart-data` returns an empty array when the table is empty
- Proper error handling when the database is unavailable
