# Base image for all stages
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo
WORKDIR /app

# Prune stage: extract only the files needed for building
FROM base AS pruner
COPY . .
RUN turbo prune --scope=web --scope=backend --out-dir=out

# Build stage: install dependencies and build the project
FROM base AS builder
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN npx prisma generate --schema=packages/prisma/schema.prisma
RUN turbo run build --filter=web --filter=backend

# Runner stage: final production image
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app .

EXPOSE 3000 5000

# We use a custom start script or run turbo directly
CMD ["turbo", "run", "dev"]
