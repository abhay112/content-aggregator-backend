# --- STAGE 1: BUILD ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for Prisma
RUN apk add --no-cache openssl g++ make python3

# Copy dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev deps to use tsc)
RUN npm ci

# Copy source code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# --- STAGE 2: RUNNER ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for Prisma
RUN apk add --no-cache openssl

# Set Production Environment
ENV NODE_ENV=production

# Copy built app and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose ports (Main API and Metrics)
EXPOSE 6001
EXPOSE 6002

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:6001/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
