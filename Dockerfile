FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY nest-cli.json prisma.config.ts tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src

ENV DATABASE_URL=postgresql://user:password@localhost:5432/database
ENV DIRECT_URL=postgresql://user:password@localhost:5432/database

RUN npm run db:generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 10000

CMD ["node", "dist/main.js"]
