# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation if needed
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/utils ./src/utils
COPY --from=builder /app/src/types ./src/types

# Data directory for SQLite
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 5001

CMD ["npm", "start"]
