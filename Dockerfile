FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY core/ ./core/

# Project workspace directories are mounted as volumes at runtime
# so agents can read/write projects, logs, handoffs, memory, etc.

CMD ["npx", "tsx", "core/index.ts"]
