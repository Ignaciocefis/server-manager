# Base stage with system dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files first (cache layer)
COPY package.json ./

# Copy Prisma schema
COPY prisma ./prisma

# Install dependencies FIRST
RUN pnpm install --force

# Install tsx
RUN pnpm add -D tsx

# Copy source code
COPY . .

# Entry point
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
