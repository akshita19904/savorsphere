# SavorSphere 

A full-stack restaurant discovery and reservation platform. Browse restaurants, filter by cuisine/price/rating/distance, view details on an interactive map, and book reservations — all with real Bangalore restaurant data.

**Live demo:** [savorsphere.vercel.app](https://savorsphere.vercel.app)

---

## Try it live

You can register your own account, or use these seeded test credentials to log in directly:

| Email | Password |
|---|---|
| `john@example.com` | *(seeded — set your own local password when testing registration flow)* |

> The seeded users are for demoing the reservations/reviews data already attached to their accounts. To test the full signup flow, register a new account instead.

---

## Features

- Browse and search restaurants by name, cuisine, or area
- Filter by cuisine, price range, minimum rating, and max distance
- List view and interactive map view
- User authentication (register, login, JWT-based sessions)
- Restaurant reservations with date/time/party size
- Reviews and ratings
- Password reset via email (Nodemailer)
- Admin panel
- Fully responsive — collapsible mobile navigation, single-column layout on small screens

---

## Architecture

```
┌─────────────┐        ┌──────────────────┐        ┌───────────────┐
│   React     │  HTTP  │  Express API      │  SQL   │   MySQL       │
│  (Vercel)   │ ─────► │  (Render)         │ ─────► │ (Clever Cloud)│
└─────────────┘        └──────────────────┘        └───────────────┘
```

- **Frontend:** React SPA, deployed on Vercel, auto-deploys on push to `main`
- **Backend:** Node/Express REST API, deployed on Render (free tier)
- **Database:** MySQL, hosted on Clever Cloud (free Dev tier)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router |
| Backend | Node.js, Express |
| Database | MySQL |
| Auth | JWT, bcrypt |
| Email | Nodemailer |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Database hosting | Clever Cloud |

---

## API Reference

Base URL (production): `https://savorsphere-backend.onrender.com/api`

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/restaurants` | List restaurants (supports `cuisine`, `priceRange`, `rating`, `distance` query filters) | No |
| GET | `/restaurants/:id` | Get a single restaurant's details | No |
| GET | `/restaurants/:id/availability` | Check reservation availability (`date`, `partySize` query params) | No |
| POST | `/auth/register` | Create a new user account | No |
| POST | `/auth/login` | Log in, returns a JWT | No |
| POST | `/reservations` | Create a reservation | Yes |
| GET | `/reservations` | Get the logged-in user's reservations | Yes |
| POST | `/reviews` | Submit a review for a restaurant | Yes |
| POST | `/auth/forgot-password` | Trigger password reset email | No |
| POST | `/auth/reset-password` | Reset password using emailed token | No |
| GET | `/health` | Health check | No |

> Authenticated routes expect a `Authorization: Bearer <token>` header.

---

## Project Structure

```
savor/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/    # api.js — axios config & API calls
│   └── .env               # REACT_APP_API_BASE_URL
├── server/          # Express backend
│   ├── server.js         # entry point, routes, DB pool, CORS
│   └── .env               # DB + JWT + CORS config (not committed)
└── database/
    ├── schema.sql         # table definitions
    └── seed.sql           # sample restaurant data (Bangalore)
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Access to a MySQL database (local install, or a free cloud instance — see [Database Setup](#database-setup))

### 1. Clone the repo
```bash
git clone https://github.com/akshita19904/savorsphere.git
cd savor
```

### 2. Set up the database
Run the schema and seed files against your MySQL instance:
```bash
mysql -h <host> -P <port> -u <user> -p <database> < database/schema.sql
mysql -h <host> -P <port> -u <user> -p <database> < database/seed.sql
```
> **Note:** table charset is `utf8mb4` to support special characters. If you connect via a CLI, use `--default-character-set=utf8mb4` to avoid encoding issues.

### 3. Configure the backend
Create `server/.env`:
```
PORT=5000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306
JWT_SECRET=generate_a_long_random_string
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Generate a secure `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Install and run:
```bash
cd server
npm install
npm start
```
Server runs on `http://localhost:5000`. Test endpoints:
- `http://localhost:5000/api/test`
- `http://localhost:5000/api/health`

### 4. Configure the frontend
Create `client/.env`:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Install and run:
```bash
cd client
npm install
npm start
```
App runs on `http://localhost:3000`.

---

## Database Setup

This project uses MySQL. For a free cloud-hosted option (used in production), [Clever Cloud](https://www.clever-cloud.com) offers a free "Dev" tier MySQL instance with no trial expiry.

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main`. Set `REACT_APP_API_BASE_URL` in Vercel's Environment Variables (Production). |
| Backend | Render | Root directory: `server`. Build: `npm install`. Start: `node server.js`. Free tier spins down after 15 min inactivity — first request after idle may take 30-50s. |
| Database | Clever Cloud | Free Dev-tier MySQL. |

### Environment variables (Render backend)
```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=3306
JWT_SECRET=
CORS_ORIGIN=https://savorsphere.vercel.app   # must include https:// exactly
NODE_ENV=production
```

