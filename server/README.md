# Thrifted API (Neon + Vercel)

A small Next.js + Hono API that sits between the Thrifted mobile app and your Neon
Postgres database. The Neon connection string lives **only here** (server-side), never
in the app.

```
Expo app  ──HTTPS──>  this API (holds DATABASE_URL)  ──>  Neon Postgres
```

## 1. Configure secrets

```bash
cd server
cp .env.example .env.local
```
Edit `.env.local`:
- `DATABASE_URL` — your Neon **pooled** connection string (Neon dashboard → Connect).
- `JWT_SECRET` — a long random string: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## 2. Install + create tables + seed demo data

```bash
npm install
npm run db:setup    # creates all tables
npm run db:seed     # optional: demo users + items (login: any seeded email / password "password")
```

## 3. Run locally

```bash
npm run dev         # http://localhost:3001
```
Test it: open http://localhost:3001/api → `{ "ok": true }`.

## 4. Deploy to Vercel

```bash
npm i -g vercel          # if not installed
vercel                   # from the server/ folder; link/create the project
vercel env add DATABASE_URL    # paste your Neon string (Production)
vercel env add JWT_SECRET      # paste your secret
vercel --prod            # deploy
```
Copy the production URL (e.g. `https://thrifted-api.vercel.app`).

## 5. Point the app at it

In the app project root, set `EXPO_PUBLIC_API_URL` in `.env` to your API URL, then restart Expo.

## Endpoints (so far)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/signup` | – | Create account → `{ token, user }` |
| POST | `/api/auth/login` | – | Log in → `{ token, user }` |
| GET | `/api/auth/me` | ✓ | Current user + favorite/follow ids |
| GET | `/api/items` | – | List/filter (`category,q,brand,size,condition,color,sort,sellerId`) |
| GET | `/api/items/:id` | – | One item + seller |
| POST | `/api/items` | ✓ | Create listing |
| PATCH | `/api/items/:id` | ✓ owner | Edit / change status |
| DELETE | `/api/items/:id` | ✓ owner | Delete |
| GET | `/api/users/:id` | – | Profile + their items + reviews |
| GET | `/api/favorites` | ✓ | Your favorited items |
| POST | `/api/favorites/:itemId` | ✓ | Toggle favorite |
| POST | `/api/follows/:userId` | ✓ | Toggle follow |

Auth is a Bearer JWT: `Authorization: Bearer <token>`.

_Next slices: conversations/messages, orders, reviews, notifications, wallet._
