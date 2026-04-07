#!/bin/bash

# --- COLORS ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Content Aggregator Backend Production Setup...${NC}\n"

# --- CHECK DEPENDENCIES ---
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker not found. Attempting to install via Homebrew...${NC}"
    if command -v brew &> /dev/null; then
      brew install --cask docker
      echo -e "${GREEN}✅ Docker installed. Please open Docker Desktop and wait for it to start.${NC}"
    else
      echo -e "${RED}❌ Homebrew not found. Please install Docker manually: https://www.docker.com/products/docker-desktop/${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}✅ Docker is installed.${NC}"
  fi
}

check_compose() {
  if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker Compose V2 not found. Attempting to install...${NC}"
    if command -v brew &> /dev/null; then
      brew install docker-compose
      echo -e "${GREEN}✅ Docker Compose installed.${NC}"
    else
      echo -e "${RED}❌ Please install Docker Compose manually.${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}✅ Docker Compose is ready.${NC}"
  fi
}

check_docker
check_compose

# --- SPIN UP CONTAINERS ---
echo -e "\n${BLUE}🏗️ Building and starting containers (this may take a few minutes)...${NC}"
docker compose up --build -d

# --- WAIT FOR APP ---
echo -e "\n${BLUE}⏳ Waiting for backend to be ready...${NC}"
ATTEMPTS=0
MAX_ATTEMPTS=20
until $(curl --output /dev/null --silent --head --fail http://localhost:6001/api/v1/health); do
  if [ ${ATTEMPTS} -eq ${MAX_ATTEMPTS} ]; then
    echo -e "${RED}❌ Backend failed to start after 20 attempts.${NC}"
    docker compose logs app
    exit 1
  fi
  printf '.'
  sleep 3
  let ATTEMPTS=ATTEMPTS+1
done
echo -e "\n${GREEN}✅ Backend is healthy!${NC}"

# --- RUN MIGRATIONS & SEED ---
echo -e "\n${BLUE}🗄️ Running Prisma migrations and seeding sources...${NC}"
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed

# --- DONE ---
echo -e "\n${GREEN}✨ Setup complete!${NC}"
echo -e "----------------------------------------"
echo -e "🎨 Grafana:      ${YELLOW}http://localhost:6003${NC} (admin / admin)"
echo -e "� API URL:      ${YELLOW}http://localhost:6001${NC}"
echo -e "📝 Swagger Docs: ${YELLOW}http://localhost:6001/api/docs${NC}"
echo -e "� Metrics URL:  ${YELLOW}http://localhost:6002/metrics${NC}"
echo -e "🔥 Prometheus:   ${YELLOW}http://localhost:9090${NC}"
echo -e "----------------------------------------"
echo -e "To view logs, run: ${BLUE}docker compose logs -f${NC}"
