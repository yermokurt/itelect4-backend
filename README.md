# itelect4-backend

[![CI](https://github.com/yermokurt/itelect4-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/yermokurt/itelect4-backend/actions/workflows/ci.yml)

Backend for the **Campus Lost & Found System** – a REST API built with Node.js, Express, TypeScript, and MongoDB. Supports JWT-based authentication, item/claim management, and Gemini AI project reviews.

## Live Links

| | URL |
|---|---|
| **Backend API** | https://yermo-itelect4-backend.vercel.app |
| **Frontend App** | https://yermo-itelect4-project.vercel.app |
| **Frontend Repo** | https://github.com/yermokurt/itelect4-project |

## Tech Stack

- Node.js + Express 5
- TypeScript (strict, ESM)
- MongoDB Atlas + Mongoose
- JWT Authentication (jsonwebtoken)
- bcryptjs (password hashing)
- Zod (request validation)
- Google Gemini AI (`@google/genai`)
- express-rate-limit

## Architecture

```
┌──────────────────────────────────────────────┐
│                  Express App                 │
│                                              │
│  POST /api/auth/register  ─┐                 │
│  POST /api/auth/login      ├── authRouter    │
│                            │                 │
│  GET  /api/items           ├──              │
│  POST /api/items           │   itemRouter   │
│  PATCH/DELETE /api/items/:id─┘   (requireAuth)│
│                                              │
│  POST /api/ai              ── aiRouter       │
│                               (requireAuth + │
│                                rate-limit +  │
│                                Gemini AI)    │
│                                              │
│  GET  /api/health          ── healthcheck    │
└───────────────────┬──────────────────────────┘
                    │ Mongoose
          ┌─────────▼──────────┐
          │   MongoDB Atlas    │
          │  (Users, Items)    │
          └────────────────────┘
```

## Local Setup

### Prerequisites

- Node.js ≥ 20
- A MongoDB Atlas cluster (free tier works)
- A Google Gemini API key (for the `/api/ai` route)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yermokurt/itelect4-backend.git
cd itelect4-backend

# 2. Install dependencies
npm install

# 3. Create the .env file
cp .env.example .env
# Then edit .env and fill in your values
```

**.env** format:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret
PORT=4000
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

```bash
# 4. Start the development server (hot-reload)
npm run dev
```

The API will be available at http://localhost:4000.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with tsx watch (hot reload) |
| `npm test` | Run Vitest tests (verbose) |
| `npm run typecheck` | TypeScript type-check without emitting |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output (`dist/server.js`) |

## API Routes

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Login and receive a JWT |

### Items (requires `Authorization: Bearer <token>`)

| Method | Route | Description |
|---|---|---|
| GET | `/api/items` | Get all items |
| GET | `/api/items/:id` | Get a single item |
| POST | `/api/items` | Create a new item |
| PATCH | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |

### AI (requires auth, rate-limited to 5 req/min)

| Method | Route | Description |
|---|---|---|
| POST | `/api/ai` | Send a prompt (≥ 20 chars) and receive an AI project review |

### Health

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Check server and database status |

## Testing

Tests use **Vitest** and **Supertest**. No running server, MongoDB, or Gemini API key is required.

```bash
npm test
```

### Test coverage (`tests/ai.test.ts`)

| Test | Expected result |
|---|---|
| No `Authorization` header | 401 |
| Invalid / tampered JWT | 401 with `"Token is invalid or has expired"` |
| Valid JWT + prompt < 20 chars | 400 with `"prompt must be at least 20 characters after trimming"` |

The DB connection (`src/config/db.js`) is mocked with `vi.mock` so tests run fully offline.

## GitHub Actions CI

The workflow (`.github/workflows/ci.yml`) runs on every push and pull request:

1. `npm ci` – install dependencies
2. `npm test` – run Vitest
3. `npm run typecheck` – TypeScript check
4. `npm run build` – compile to `dist/`

## AI-Use Disclosure

Created with the help of Claude Sonnet 4.6 Model through the Antigravity CLI