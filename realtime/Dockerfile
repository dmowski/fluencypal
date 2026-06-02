FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
COPY test-client ./test-client
RUN pnpm build && pnpm build:client

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/test-client/dist ./test-client-dist

EXPOSE 8081

CMD ["node", "dist/index.js"]
