# Plan: Neon Auth — User Registration and Authentication

## Context
The dashboard is open to everyone. We need login/signup pages so only authenticated users can access it. The user chose Neon Auth SDK, localStorage for tokens, and wants a forgot-password flow.

**Key constraint:** Neon Auth (`@neondatabase/neon-js`) is designed for JS/TS. It handles auth via BetterAuth under the hood — sessions are managed client-side. For the Flask backend, we validate the session token (JWT) by verifying it against Neon Auth's JWKS endpoint or session API.

## Architecture

```
React SPA (@neondatabase/neon-js auth client)
  ├── /login        → LoginPage (public)
  ├── /signup       → SignUpPage (public)
  ├── /forgot       → ForgotPasswordPage (public)
  └── /dashboard    → Dashboard (protected, requires session)
        │
        ▼ fetch with Authorization: Bearer <token>
Flask API (validates JWT from Neon Auth)
  ├── /api/hello         (public)
  ├── /api/chart-data    (protected)
  └── /api/health        (protected)
```

## Neon Project Info
- **Project ID:** `old-credit-70418010`
- **Branch:** `claude/feature/neon-auth`

---

## Execution Steps

### Step 1: Provision Neon Auth (MCP)
**No dependencies — run first**

1. Call `mcp__Neon__provision_neon_auth` for project `old-credit-70418010`
2. Capture the `NEON_AUTH_BASE_URL` from the response
3. Update `server/.env` with `NEON_AUTH_BASE_URL`
4. Update `server/.env.example` with placeholder

### Step 2: Install Dependencies
**Depends on: Step 1 (need env vars)**

Run in parallel:
- **npm:** `npm install react-router-dom @neondatabase/neon-js better-auth`
- **pip:** `pip install PyJWT cryptography requests` + update `server/requirements.txt`

### Agent A: Frontend (after Steps 1-2)
**Files to create/modify:**

| File | Action |
|---|---|
| `src/lib/auth.ts` | Create — Neon Auth client setup |
| `src/context/AuthContext.tsx` | Create — Auth provider with session state |
| `src/components/LoginPage.tsx` | Create — Email/password login form (shadcn-ui) |
| `src/components/SignUpPage.tsx` | Create — Registration form (shadcn-ui) |
| `src/components/ForgotPasswordPage.tsx` | Create — Forgot password form (shadcn-ui) |
| `src/components/Dashboard.tsx` | Modify — Add logout button in header |
| `src/App.tsx` | Rewrite — Add react-router-dom routes + AuthContext provider |
| `src/main.tsx` | Modify — Wrap with BrowserRouter |

#### `src/lib/auth.ts`
- Import `createAuthClient` from `@neondatabase/neon-js/auth`
- Create client with `import.meta.env.VITE_NEON_AUTH_URL`
- Export `authClient`

#### `src/context/AuthContext.tsx`
- Auth provider managing session state via `authClient.getSession()`
- Store token in localStorage on login/signup
- Expose: `user`, `token`, `isAuthenticated`, `loading`, `login()`, `signup()`, `logout()`
- `login`/`signup` call `authClient.signIn.email` / `authClient.signUp.email`
- On success, get session token and store in localStorage

#### Route Protection
- `ProtectedRoute` wrapper component: if not authenticated → redirect to `/login`
- Public routes (`/login`, `/signup`, `/forgot`): if already authenticated → redirect to `/dashboard`

#### `src/App.tsx` Routes
```
/          → redirect to /dashboard
/login     → LoginPage
/signup    → SignUpPage
/forgot    → ForgotPasswordPage
/dashboard → ProtectedRoute → Dashboard
```

#### Login/SignUp/Forgot Pages
- Use shadcn-ui Card, Button, and native input elements
- Login: email + password fields, "Forgot password?" link, "Sign up" link
- SignUp: name + email + password + confirm password fields, "Log in" link
- Forgot: email field, "Back to login" link
- All forms show error messages on failure
- On success, redirect to `/dashboard`

#### Dashboard Logout
- Add a logout button in the dashboard header (top-right)
- On click: call `authClient.signOut()`, clear localStorage, redirect to `/login`

### Agent B: Backend (parallel with Agent A, after Steps 1-2)
**Files to modify:**

| File | Action |
|---|---|
| `server/app.py` | Modify — Add JWT validation middleware, protect routes |
| `server/requirements.txt` | Modify — Add PyJWT, cryptography, requests |
| `server/.env.example` | Modify — Add NEON_AUTH_BASE_URL |

#### JWT Validation in Flask
- Fetch JWKS (JSON Web Key Set) from `{NEON_AUTH_BASE_URL}/.well-known/jwks.json` on startup (cache keys)
- Create `require_auth` decorator that:
  1. Extracts `Authorization: Bearer <token>` from request headers
  2. Decodes and verifies the JWT using the JWKS public key
  3. Returns 401 with JSON error if missing/invalid/expired
  4. Attaches user info to Flask `g` object for route handlers
- Apply `@require_auth` to `/api/chart-data` and `/api/health`
- Keep `/api/hello` public

### Agent C: Env & Config (parallel with A and B)
**Files to modify:**

| File | Action |
|---|---|
| `.env` (root, create) | `VITE_NEON_AUTH_URL=<from step 1>` |
| `vite.config.ts` | Verify env vars are passed through (Vite does this automatically for `VITE_` prefix) |

### Agent D: Tests (after A and B)

**Backend tests** (`test/test_auth.py`):
- Protected endpoints return 401 without token
- Protected endpoints return 401 with invalid token
- `/api/hello` works without token
- Valid token allows access to `/api/chart-data`

**Frontend tests** (`test/Auth.test.tsx`):
- Unauthenticated user redirected from `/dashboard` to `/login`
- Login form renders with email/password fields
- SignUp form renders with all required fields

### Agent E: Verify (after D)
1. Start dev server: `npm run dev`
2. Visit `localhost:5173` → should redirect to `/login`
3. Click "Sign up" → register a user
4. Should redirect to `/dashboard` showing data table + charts
5. Refresh page → should stay on dashboard (token persisted)
6. Click logout → should redirect to `/login`
7. `curl localhost:5001/api/chart-data` without token → 401
8. `curl localhost:5001/api/hello` → 200

## Parallelism Summary

```
Step 1 (Provision Neon Auth)  ████
Step 2 (Install deps)             ████
Agent A (Frontend)                    ████████████
Agent B (Backend)                     ████████████
Agent C (Env/Config)                  ████
Agent D (Tests)                                   ████
Agent E (Verify)                                       ████
```

## Key Dependencies
- `react-router-dom` — client-side routing
- `@neondatabase/neon-js` — Neon Auth client
- `better-auth` — peer dependency for React adapter
- `PyJWT` + `cryptography` — JWT verification on Flask
- `requests` — fetch JWKS from Neon Auth
