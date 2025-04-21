COMPOSE_DEV  := docker-compose.yml
COMPOSE_PROD := docker-compose.prod.yml
DOCKER_DEV   := docker compose -f $(COMPOSE_DEV)
DOCKER_PROD  := docker compose -f $(COMPOSE_PROD)
DATABASE     := ./backend/database/data.db

RM = rm -rf

all: dev

dev: dep-up
prod: prod-up

dev-up:
	@$(DOCKER_DEV) up --build -d

prod-up:
	@$(DOCKER_PROD) up --build -d

down: dev-down prod-down

dev-down:
	@$(DOCKER_DEV) down

prod-down:
	@$(DOCKER_PROD) down

ps: dev-ps prod-ps

dev-ps:
	@echo "Development containers"
	@$(DOCKER_DEV) ps

prod-ps:
	@echo "Production containers"
	@$(DOCKER_PROD) ps

logs: dev-logs prod-logs

dev-logs:
	@$(DOCKER_DEV) logs

prod-logs:
	@$(DOCKER_PROD) logs

re: down dev

fclean: down
	@$(DOCKER_DEV) down -v --rmi all
	@$(DOCKER_PROD) down -v --rmi all

nuke:
	@echo "Deleted database"
	@$(RM) $(DATABASE)

test: test-back test-front test-lint

test-back:
	@cd backend && NODE_ENV=production pnpm exec tsc --project tsconfig.prod.json --noEmit && echo "✅ Backend TypeScript check passed"
	@cd backend/services/main_server && NODE_ENV=production pnpm exec tsc --noEmit && echo "✅ Main server check passed"
	@cd backend/services/game_service && NODE_ENV=production pnpm exec tsc --noEmit && echo "✅ Game service check passed"
	@cd backend/services/matchmaking_service && NODE_ENV=production pnpm exec tsc --noEmit && echo "✅ Matchmaking service check passed"
	@cd backend/services/user_service && NODE_ENV=production pnpm exec tsc --noEmit && echo "✅ User service check passed"

test-front:
	@cd frontend && NODE_ENV=production pnpm tsc --noEmit && echo "✅ Frontend TypeScript check passed"
	@cd frontend && NODE_ENV=production pnpm exec vite build --dry-run && echo "✅ Frontend build check passed"

test-lint:
	@cd frontend && NODE_ENV=production pnpm exec eslint . --max-warnings=0 && echo "✅ All linting checks passed"

.PHONY: dev-up dev-down dev-ps dev-logs
.PHONY: prod-up prod-down prod-ps prod-logs
.PHONY: all re clean fclean nuke test
