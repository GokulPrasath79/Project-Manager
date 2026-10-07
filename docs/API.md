# API documentation

Base URL: `http://localhost:4000/api` (local) or `https://<your-backend>/api` (deployed).
All bodies are JSON. Protected routes need the header `Authorization: Bearer <token>`.

Errors use `{ "error": "message", "details": [...] }`. Validation errors are `400` with
`details: [{ field, message }]`. Other codes: `401` not authenticated / expired, `404` not found
(also returned for other users' data), `409` duplicate email, `429` rate limited.

## Auth
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ fullName, email, password (min 8) }` | `201 { token, user }` |
| POST | `/auth/login` | `{ email, password }` | `200 { token, user }` |
| POST | `/auth/logout` | none (auth) | `200 { message }` , invalidates all tokens of that user |
| GET | `/auth/me` | none (auth) | `200 { user }` |

Register and login are limited to 10 requests per 15 minutes per IP.

## Projects (auth)
| Method | Path | Notes |
|---|---|---|
| GET | `/projects` | Query: `q` (name search), `status`, `sortBy` (createdAt\|name\|endDate), `order`, `page`, `limit`. Returns `{ data, pagination }` with `taskCount`, `completedTaskCount` |
| GET | `/projects/:id` | Returns `{ project }` including its `tasks` |
| POST | `/projects` | `{ name, description?, status?, startDate?, endDate? }` |
| PUT | `/projects/:id` | Any subset of the create fields |
| DELETE | `/projects/:id` | `204`, tasks are deleted too |

`status`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`. Dates: ISO strings like `2026-12-31`. `endDate` must be on or after `startDate`.

## Tasks (auth)
| Method | Path | Notes |
|---|---|---|
| GET | `/tasks` | Query: `projectId`, `q` (name search), `status`, `priority`, `sortBy` (createdAt\|name\|dueDate\|priority), `order`, `page`, `limit` |
| GET | `/tasks/:id` | `{ task }` |
| POST | `/tasks` | `{ projectId, name, description?, priority?, status?, dueDate? }` |
| PUT | `/tasks/:id` | Any subset of `name, description, priority, status, dueDate`. Mark complete: `{ "status": "COMPLETED" }` |
| DELETE | `/tasks/:id` | `204` |

`priority`: `LOW`, `MEDIUM`, `HIGH`. `status`: `PENDING`, `IN_PROGRESS`, `COMPLETED`.

## Dashboard (auth)
`GET /dashboard` returns
```json
{ "totalProjects": 2, "totalTasks": 3, "completedTasks": 1, "pendingTasks": 1, "inProgressTasks": 1, "projectsInProgress": 1 }
```
Counts cover only the signed-in user's data.

## Health
`GET /health` returns `{ "status": "ok" }`.

## Example
```bash
curl -X POST localhost:4000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"Password123"}'
curl localhost:4000/api/dashboard -H "Authorization: Bearer $TOKEN"
```
