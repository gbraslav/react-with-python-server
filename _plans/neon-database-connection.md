# Plan: Neon Database Connection

## Context
The Flask backend currently serves hardcoded in-memory data (`CHART_DATA` — 25 rows in `server/app.py`). This plan connects it to the Neon Postgres database `python_server` (project ID: `old-credit-70418010`) using SQLAlchemy ORM, seeds 50 rows of generated data, and adds a `/api/health` endpoint. The frontend requires zero changes.

## Neon Project Info
- **Project ID:** `old-credit-70418010`
- **Database:** `neondb` (default)
- **Region:** aws-us-east-1

---

## Execution Steps

### Agent 1: Database Setup (Neon MCP)
Can run **in parallel** with Agent 2.

1. **Create `chart_data` table** via `mcp__Neon__run_sql`:
   ```sql
   CREATE TABLE chart_data (
     id SERIAL PRIMARY KEY,
     month VARCHAR(7) NOT NULL,
     data_field1 NUMERIC(6,2) NOT NULL,
     data_field2 NUMERIC(8,2) NOT NULL,
     data_field3 NUMERIC(6,2) NOT NULL,
     data_field4 VARCHAR(2) NOT NULL
   );
   ```

2. **Seed 50 rows** via `mcp__Neon__run_sql` — generate realistic data spanning 2024-01 to 2024-12, with values in similar ranges to the original hardcoded data:
   - `data_field1`: 25–85
   - `data_field2`: 200–750
   - `data_field3`: 5–40
   - `data_field4`: one of 'A', 'B', 'AB'

3. **Get connection string** via `mcp__Neon__get_connection_string` for the `.env` file.

### Agent 2: Server Code Changes
Can run **in parallel** with Agent 1.

Files to modify:
- `server/requirements.txt`
- `server/app.py`
- `.gitignore`

New files to create:
- `server/.env.example`
- `server/.env` (gitignored)

#### Step 2a: Update `server/requirements.txt`
Add:
```
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0
python-dotenv>=1.0.0
```

#### Step 2b: Add `.env` to `.gitignore`
Append `.env` to the existing `.gitignore`.

#### Step 2c: Create `server/.env.example`
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

#### Step 2d: Create `server/.env`
Populate with the actual Neon connection string (from Agent 1, step 3). **This step depends on Agent 1 completing step 3.**

#### Step 2e: Rewrite `server/app.py`
- Import `sqlalchemy`, `python-dotenv`
- Load `.env` using `dotenv.load_dotenv()`
- Fail fast if `DATABASE_URL` is missing
- Define SQLAlchemy engine + session from `DATABASE_URL`
- Define `ChartData` ORM model mapping to `chart_data` table
- Replace `CHART_DATA` list and `/api/chart-data` route with a DB query
- Add `GET /api/health` endpoint that runs `SELECT 1` and returns `{"status": "ok"}` or error
- Keep `/api/hello` unchanged
- Properly handle DB errors (return JSON error, don't crash)

### Agent 3: Tests
Runs **after** Agents 1 and 2 complete.

File to create: `test/api.test.py` (or integrate into existing test structure)

Tests:
- `/api/chart-data` returns a JSON array with expected keys (`id`, `month`, `data_field1`–`data_field4`)
- `/api/chart-data` returns 50 rows from seeded DB
- `/api/health` returns `{"status": "ok"}`
- Error handling when DB is unavailable (mock connection failure)

### Agent 4: Install & Verify
Runs **after** Agents 2 and 3 complete.

1. `pip install -r server/requirements.txt` (in the venv)
2. Start the server: `npm run dev:server`
3. Verify `curl http://localhost:5001/api/health` returns `{"status": "ok"}`
4. Verify `curl http://localhost:5001/api/chart-data` returns 50 rows with correct shape
5. Run `npm run dev` and confirm frontend dashboard renders correctly

---

## Critical Files

| File | Action |
|---|---|
| `server/app.py` | Rewrite — add SQLAlchemy, remove hardcoded data |
| `server/requirements.txt` | Edit — add 3 dependencies |
| `.gitignore` | Edit — add `.env` |
| `server/.env` | Create (gitignored) — Neon connection string |
| `server/.env.example` | Create — template for other devs |
| `test/api.test.py` | Create — backend API tests |

## Parallelism Summary

```
Time →

Agent 1 (DB setup)     ████████░░░░░░░░
Agent 2 (Server code)  ████████████░░░░  (step 2d waits on Agent 1)
Agent 3 (Tests)         ░░░░░░░░████░░░░
Agent 4 (Verify)        ░░░░░░░░░░░░████
```

## Verification
- `curl localhost:5001/api/health` → `{"status": "ok"}`
- `curl localhost:5001/api/chart-data` → 50-row JSON array
- Frontend dashboard at `localhost:5173` renders table, charts, and Venn diagram with DB data
- All tests pass
