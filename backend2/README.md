# InvestmanWeb FastAPI Backend

FastAPI REST API for a MariaDB database. The API uses SQLAlchemy reflection, so it automatically exposes tables in the target schema (including the tables defined in `/home/jeff/builds/investmanweb/schema.sql`).

## 1) Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your MariaDB credentials.

## 2) Create/import database schema

If the database does not already exist:

```bash
mysql -u <user> -p -e "CREATE DATABASE IF NOT EXISTS investmanweb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
mysql -u <user> -p investmanweb < /home/jeff/builds/investmanweb/schema.sql
```

## 3) Run API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open docs at:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Endpoints

- `GET /health`
- `GET /tables`
- `GET /{table_name}?limit=100&offset=0`
- `GET /{table_name}/{record_id}`
- `POST /{table_name}` with body: `{ "data": { ... } }`
- `PUT /{table_name}/{record_id}` with body: `{ "data": { ... } }`
- `PATCH /{table_name}/{record_id}` with body: `{ "data": { ... } }`
- `DELETE /{table_name}/{record_id}`

## Notes

- API currently supports tables with a **single-column primary key** for item-level operations.
- Reflection runs at app startup, so schema changes are picked up on restart.
