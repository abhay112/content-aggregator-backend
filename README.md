# Content Aggregator Backend

Production-ready backend for the Content Aggregator service.

## 🐳 Docker Deployment (One-Click Setup)

To quickly spin up the entire stack including the PostgreSQL database, migrations, and healthchecks, use the included setup script:

```bash
chmod +x setup.sh && ./setup.sh
```

The script will:
1. Check for **Docker** and **Docker Compose**.
2. Start a **PostgreSQL** container.
3. Build the **Node.js/TypeScript** application using a multi-stage Dockerfile.
4. Run **Prisma migrations** to prepare the database.
5. Provide you with the **Health Check**, **API**, and **Metrics** URLs.

### Manual Commands

If you prefer running manual Docker commands:

```bash
# Build and start services
docker compose up --build -d

# Manual migrations (if needed)
docker compose exec app npx prisma migrate deploy

# View logs
docker compose logs -f app
```

## 📊 Monitoring & API

- **API Documentation (Swagger):** `http://localhost:6001/api/docs`
- **Prometheus Metrics:** `http://localhost:6002/metrics`
- **Health Check:** `http://localhost:6001/health`

## 🛠️ Tech Stack

- **Framework:** Express + TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Monitoring:** Prometheus
- **Containerization:** Docker + Docker Compose



----

npx prisma studio