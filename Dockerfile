FROM node:16-alpine AS base
# Install dependencies only when needed.
# Install ffmpeg .
RUN apk update && apk add --no-cache libc6-compat ffmpeg
# Build stage for dependencies
FROM node:16-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci
# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Additional global packages.
RUN npm install forever nodemon pm2 cross-env -g
COPY . .
# This will do the trick, use the corresponding env file for each environment.
RUN mv .env.example .env.production
RUN npm run build
# We do not need any envarioment files since we are using docker secrets.
RUN rm .env.production
# Production image, copy all the files and run next
FROM builder AS runner
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
# Use ENTRYPOINT to set a script to run as the container entrypoint
ENTRYPOINT ["sh","docker-entrypoint.sh"]