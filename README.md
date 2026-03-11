# Todo App

React + Express + PostgreSQL monorepo.

## Quick start

### 1. Start Postgres
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:3001

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

## Structure

```
todo-app/
├── backend/
│   ├── schema.sql        # DB schema (auto-applied via Docker)
│   ├── src/
│   │   ├── db.js         # pg Pool
│   │   ├── index.js      # Express entry point
│   │   └── routes/
│   │       └── todos.js  # CRUD routes
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── AddTodo.jsx
│           ├── TodoItem.jsx
│           └── TodoList.jsx
└── docker-compose.yml
```

## API

| Method | Path           | Description       |
|--------|----------------|-------------------|
| GET    | /api/todos     | List all todos    |
| POST   | /api/todos     | Create a todo     |
| PATCH  | /api/todos/:id | Toggle completed  |
| DELETE | /api/todos/:id | Delete a todo     |
