# Spec for Neon Auth User Registration and Login

branch: claude/feature/neon-auth

## Summary
Add user registration and authentication using Neon Auth. Create login and sign-up pages. Unauthenticated users cannot access the dashboard and are redirected to the login page. After successful sign-in or registration, users are redirected to the dashboard.

## Functional Requirements
- Sign Up page with email and password fields; creates a new user account
- Log In page with email and password fields; authenticates existing users
- Unauthenticated users are redirected to the login page when attempting to access the dashboard
- After successful login or registration, users are redirected to the dashboard
- A logout button on the dashboard that signs the user out and redirects to the login page
- Backend API endpoints for registration, login, and fetching the current user
- Protected API routes (`/api/chart-data`, `/api/health`) require a valid auth token
- `/api/hello` remains publicly accessible
- User passwords are securely hashed before storage
- Auth tokens (JWT) are stored client-side and sent with API requests

## Possible Edge Cases
- Duplicate email registration — return a clear error message
- Invalid credentials on login — return a generic "invalid email or password" message (avoid leaking which field is wrong)
- Expired or tampered JWT — return 401 and redirect to login
- Empty or missing form fields — client-side validation before submission
- Token missing from localStorage on page refresh — redirect to login

## Acceptance Criteria
- Visiting `/dashboard` without authentication redirects to `/login`
- A new user can register at `/signup` and is redirected to `/dashboard`
- An existing user can log in at `/login` and is redirected to `/dashboard`
- Refreshing the page while authenticated keeps the user on the dashboard
- Logging out redirects to `/login` and clears the auth token
- `/api/chart-data` returns 401 without a valid token
- `/api/hello` remains accessible without authentication
- All UI uses shadcn-ui components

## Open Questions
- Should we use Neon Auth SDK or implement JWT auth manually with bcrypt + PyJWT? Neon auth dsk
- Should there be a "forgot password" flow in this iteration? yes
- Should user sessions persist via localStorage or httpOnly cookies? localStorage

# Testing Guidelines
Create a test file(s) in the ./test folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Registration with valid credentials creates a user and returns a token
- Registration with duplicate email returns an error
- Login with valid credentials returns a token
- Login with invalid credentials returns 401
- Protected endpoints return 401 without a token
- Protected endpoints return data with a valid token
