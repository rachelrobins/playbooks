# Playblocks

A minimal web app for creating and simulating security automation playbooks.
Users register/log in, build playbooks (a trigger + 1–3 actions), and simulate
a security event to see which of their playbooks would fire and what actions
would run.

## Architecture

Two independently runnable services:

```
playblocks/
├── backend/    Node.js + TypeScript + Express + Prisma (SQLite)
└── frontend/   React + TypeScript + Vite
```

**Backend** is organized by feature module (`auth`, `playbooks`, `simulate`, `meta`),
each with `schemas` (zod validation), `service` (business logic / DB access),
`controller` (thin request/response glue), and `routes`. Shared concerns
(env config, Prisma client, error types, the `asyncHandler`/`errorHandler`
pair) live in `src/config` and `src/common`/`src/middleware`.

**Frontend** has three routed pages (`Login/Register`, `Create Playbook`,
`Simulate Event`), a small `api/` client per resource, an `AuthContext` that
persists the JWT + user to `localStorage`, and reusable presentational
components (`PlaybookCard`, `TriggerSelect`, `ActionCheckboxGroup`).

## Data model

- `User(id, email, passwordHash)`
- `Playbook(id, userId, name, trigger, actions[])` — `trigger` is one of
  `Malware Detected | Login Attempt | Phishing Alert`; `actions` is 1–3 of
  `Isolate Host | Notify Admin | Block IP`, enforced by zod on the backend
  and by the checkbox UI on the frontend. The allowed values are served from
  `GET /meta` so the two stay in sync without hardcoding twice.

## API

| Method | Path              | Auth | Description                                   |
|--------|-------------------|------|------------------------------------------------|
| POST   | /auth/register    | No   | Create a user, returns `{ token, user }`       |
| POST   | /auth/login       | No   | Log in, returns `{ token, user }`              |
| GET    | /playbooks        | Yes  | List the current user's playbooks              |
| POST   | /playbooks        | Yes  | Create a playbook                              |
| DELETE | /playbooks/:id    | Yes  | Delete a playbook owned by the current user     |
| POST   | /simulateTrigger  | Yes  | `{ trigger }` → matching playbooks + actions    |
| GET    | /meta             | No   | Allowed trigger/action enums                    |

Authenticated routes expect `Authorization: Bearer <token>`.

**Error contract**: every non-2xx response body is `{ error: string, code?: string }`.
`error` is a human-readable message safe to show directly to the user; `code` is a stable
machine-readable identifier (`UNAUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `VALIDATION_ERROR`,
`INTERNAL_ERROR`) for client code that needs to branch on the error type instead of
string-matching `error`. On the frontend, `apiRequest` (`frontend/src/api/client.ts`)
throws a matching `ApiError { status, message, code }` for every failure — including
network errors and client-side timeouts (`status: 0`) — so callers always deal with one
error type. A `401` on an authenticated request also triggers an automatic logout,
redirecting to `/login` via the existing route guard.

## Prerequisites

Install Node.js 18+ (LTS) before continuing: https://nodejs.org

## Running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init   # creates dev.db and applies the schema
npm run dev                           # starts on http://localhost:4000
```

You don't need to edit `backend/.env` for local dev — the defaults just work:
- `DATABASE_URL` points at a local SQLite file that Prisma creates for you.
- `JWT_SECRET` is a placeholder in `.env.example` so the app can be run
  immediately for local evaluation. It must be replaced with a
  cryptographically random secret before deployment or any shared/non-local
  environment.
- `PORT` / `CORS_ORIGIN` only need changing if `4000` is taken or you run
  the frontend on a port other than `5173`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env                  # VITE_API_URL defaults to http://localhost:4000
npm run dev                           # starts on http://localhost:5173
```

Nothing to edit here either, as long as the backend is running on port
`4000`. If you changed the backend's `PORT`, update `VITE_API_URL` to match.

Open http://localhost:5173, register a user, create a playbook, then go to
"Simulate Event" and pick a trigger to see which playbooks match.

## Tests

```bash
cd backend && npm test     # Jest + Supertest, runs against an isolated SQLite test.db
cd frontend && npm test    # Vitest + React Testing Library
```

Backend tests cover: registration/login (incl. duplicate email, bad
credentials, validation errors), playbook CRUD (incl. ownership isolation
between users, action-count/enum validation), and trigger simulation
(matching, no-match, invalid trigger, auth requirement).

Frontend tests cover: the `apiRequest` client (success/error parsing, network
failures, request timeouts, and that the 401→logout handler fires only for
authenticated requests), `AuthContext` (restoring a persisted session,
auto-logout + storage clearing on a 401), the register form's password
strength gating (weak passwords block submit and show a warning; login mode
is unaffected), and presentational components (`ActionCheckboxGroup`,
`PlaybookCard`).

## Troubleshooting

**Register/Login fails with "Something went wrong. Please try again.",
and the browser console shows a CORS error like:**

```
Access to fetch at 'http://localhost:4000/auth/register' from origin
'http://localhost:5174' has been blocked by CORS policy: Response to
preflight request doesn't pass access control check: The
'Access-Control-Allow-Origin' header has a value 'http://localhost:5173'
that is not equal to the supplied origin.
```

This means Vite couldn't bind to `5173` (usually because another process,
often a leftover dev server, is already using it) and started the frontend
on `5174` (or another port) instead, while the backend's `CORS_ORIGIN` is
still set to `5173`. Fix by either:

- Stopping whatever is using port `5173`, then restarting `npm run dev` in
  `frontend/` so it binds to `5173` again, **or**
- Updating `CORS_ORIGIN` in `backend/.env` to match the port the frontend
  actually printed on startup, then restarting the backend.

Check the terminal output of `npm run dev` in `frontend/` to confirm which
port it's actually running on — Vite prints it on startup.

## Design notes / trade-offs

- **SQLite via Prisma**: zero external services to stand up for a take-home;
  swapping to Postgres later is a one-line `datasource` change plus a new
  `DATABASE_URL`.
- **JWT, not sessions**: simplest way to satisfy "basic token system to
  protect routes" without adding a session store.
- **Actions/trigger enums served from `/meta`**: keeps the frontend's
  dropdown/checkboxes in sync with backend validation without duplicating
  the literal lists in two places.
- **Editing playbooks is not implemented** (explicitly optional in the spec).
- **Actions stored as a JSON-encoded string column**: SQLite has no native
  array type; Prisma's `Json` type isn't supported by the SQLite connector
  either, so the DTO layer (`playbooks.service.ts`) handles the
  serialize/deserialize boundary.
- **JWT stored in `localStorage`**: convenient for a take-home (no cookie/CSRF
  plumbing needed), but vulnerable to XSS: any injected script can read
  `localStorage` and steal the token. If you plan to run this in production,
  migrate to an HttpOnly cookie so the token is inaccessible to JavaScript.
- **No repository/adapter layer**: services (e.g. `playbooks.service.ts`) call
  Prisma directly. Fine at this scale; add a repository/adapter layer if you
  expect DB changes or more complex queries: it isolates Prisma from domain
  logic and makes testing easier.
