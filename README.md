# Taskyard: Project Management System (Web + Mobile)

One backend and one PostgreSQL database serve a React web app and a React Native (Expo) Android app.
Log in with the same account on both and see the same projects and tasks.

| Part | Tech |
|---|---|
| Backend | Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt, Zod, helmet, morgan, express-rate-limit |
| Web | React 18 + Vite + React Router |
| Mobile | React Native (Expo), React Navigation, expo-secure-store (Android Keystore / iOS Keychain) |

Docs: [API](docs/API.md) | [ER diagram](docs/ER_DIAGRAM.md)

## Repo layout
```
backend/   Express API + Prisma schema
web/       React web app
mobile/    Expo app (source files + setup script)
docs/      API docs and ER diagram
```

## 1. Database
Pick one:
- **Docker:** `docker compose up db -d` (Postgres on localhost:5432, user/password `postgres`, db `project_manager`)
- **Neon (free, hosted):** create a project at neon.tech and copy its connection string.
- **Local Postgres:** create a database named `project_manager`.

## 2. Backend
```bash
cd backend
npm install
cp .env.example .env        # then edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init   # creates the tables
npm run seed                # optional: demo@example.com / Password123
npm run dev                 # http://localhost:4000/api/health
npm test                    # validator unit tests
```

### Environment variables (`backend/.env`)
| Name | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `7d` |
| `PORT` | no | Default `4000` |
| `CORS_ORIGINS` | yes for web | Comma-separated allowed web origins, e.g. `http://localhost:5173,https://your-app.vercel.app` |
| `NODE_ENV` | no | `production` hides error internals |

## 3. Web
```bash
cd web
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm run dev                 # http://localhost:5173
```
| Name | Description |
|---|---|
| `VITE_API_URL` | Backend base URL including `/api` |

## 4. Mobile (Android)
Expo versions change often, so the setup script generates a fresh Expo project and drops this app's code into it:
```bash
bash mobile/setup.sh
cd mobile
# edit .env: set EXPO_PUBLIC_API_URL (see below)
npx expo start
```
Scan the QR code with **Expo Go** on your Android phone (same Wi-Fi as your computer).

| Name | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Android emulator: `http://10.0.2.2:4000/api`. Real phone on LAN: `http://<computer-LAN-IP>:4000/api`. Deployed: `https://<backend>/api` |

### Running the mobile app against the deployed backend
1. Set `EXPO_PUBLIC_API_URL=https://<your-backend>/api` in `mobile/.env`.
2. `npx expo start -c` (the `-c` clears the cache so the new value is used).

### Build an APK
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```
`mobile/eas.json` already has an APK profile. Replace `YOUR-BACKEND` in its `env` block with your deployed API URL, and add `"android": { "package": "com.yourname.taskyard" }` inside `expo` in `app.json`.

## 5. Deploy
- **Database:** Neon.
- **Backend (Render):** New Web Service, root dir `backend`, build `npm install && npx prisma generate`, start `npx prisma migrate deploy && npm start`. Set env vars above; `CORS_ORIGINS` = your web URL.
- **Web (Vercel):** root dir `web`, framework Vite, env `VITE_API_URL=https://<backend>/api`. Add a rewrite of all routes to `/index.html` (SPA).
- **Docker alternative:** `docker compose up --build` runs Postgres and the API.

## Security summary
- Passwords hashed with bcrypt (cost 12); never returned by the API.
- JWT auth middleware on all routes except register/login/health; logout bumps `tokenVersion` so old tokens stop working.
- Every project/task query is scoped to the signed-in user; other users' records return 404.
- Zod validation on every request (required fields, email, dates, enums, ranges).
- Prisma parameterized queries (no raw SQL), so no SQL injection.
- Rate limit on login/register (10 per 15 min per IP) plus a general API limit; helmet headers; CORS allow-list.
- Mobile token stored in Android Keystore / iOS Keychain via `expo-secure-store`; expired token returns the user to login with a message.

## Bonus features included
Docker, unit tests, pagination, sorting, CI (GitHub Actions).

## Design notes (for the review session)
- **Ownership via project:** tasks have no `userId`; `task.project.userId` is checked, avoiding duplicated data.
- **Stateless JWT + `tokenVersion`:** simple to scale, yet logout truly invalidates tokens.
- **One API for both clients:** web and mobile share the exact same endpoints and validation.
- **Mobile CORS:** native apps send no `Origin`, so only browsers are restricted by the allow-list.
