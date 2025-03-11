FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm@latest-10

ENV CI=true

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

COPY backend/services/main_server/package.json ./backend/services/main_server/
COPY backend/services/game_service/package.json ./backend/services/game_service/
COPY backend/services/matchmaking_service/package.json ./backend/services/matchmaking_service/
COPY backend/services/user_service/package.json ./backend/services/user_service/
COPY backend/services/remote_service/package.json ./backend/services/remote_service/

COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

COPY backend ./backend/
COPY shared ./shared/

CMD ["pnpm", "run", "dev:backend"]
