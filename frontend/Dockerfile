FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm@latest-10

ENV CI=true

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY frontend/package.json ./frontend/
COPY shared ./shared/

RUN pnpm install --frozen-lockfile

COPY frontend ./frontend/

CMD ["pnpm", "run", "dev:frontend", "--", "--host"]
