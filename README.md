# KarmDeep Platform (MERN Conversion)

This folder is a **MERN-stack** conversion of the existing `design_engineering/` project.

## Stack
- **MongoDB** (database)
- **Express** + **Node.js** (API)
- **React** (web app)
- **TypeScript** (backend + frontend)

## What’s Included
- `backend/`: Express API (TypeScript) with Mongoose models + REST routes
- `frontend/`: React app (copied from existing project; API base URL config updated)
- `db.md`: database schema (collections, fields, indexes, relationships)

## Quick start (local)

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Backend defaults to `http://localhost:4000`.

## Notes
- Auth is JWT-based (simple local implementation). You can later swap to Cognito/Auth0.
- File storage / events (S3/SNS equivalents) are stubbed as internal services for now.
