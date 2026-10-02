# itelect4-backend

Backend for the Campus Lost & Found System built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcryptjs

## Getting Started

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env` file based on `.env.example`

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=4000
```

4. Start the development server

```bash
npm run dev
```
## API Routes

### Auth

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a token |

### Items (requires Authorization header)

| Method | Route | Description |
|---|---|---|
| GET | `/api/items` | Get all items for the logged-in user |
| GET | `/api/items/:id` | Get a single item |
| POST | `/api/items` | Create a new item |
| PATCH | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |

### Health

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Check server and database status |

## Authentication

Protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```
