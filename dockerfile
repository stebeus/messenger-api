FROM ghcr.io/pnpm/pnpm:12 AS base

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm ci

COPY . .

CMD [ "pnpm", "start" ]
