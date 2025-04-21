COMPOSE_DEV  := docker-compose.yml
COMPOSE_PROD := docker-compose.prod.yml
DOCKER_DEV   := docker compose -f $(COMPOSE_DEV)
DOCKER_PROD  := docker compose -f $(COMPOSE_PROD)
DATABASE     := ./backend/database/data.db

RM = rm -rf

LOG_DIR      := ./logs
BACKEND_LOG  := $(LOG_DIR)/error-backend.log
FRONTEND_LOG := $(LOG_DIR)/error-frontend.log
ESLINT_LOG   := $(LOG_DIR)/error-eslint.log

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

prep-logs:
	@mkdir -p $(LOG_DIR)
	@echo "" > $(BACKEND_LOG)
	@echo "" > $(FRONTEND_LOG)
	@echo "" > $(ESLINT_LOG)

test: prep-logs test-back test-front test-lint

test-back:
	@echo "Testing backend..."
	@(cd backend && NODE_ENV=production pnpm exec tsc --project tsconfig.prod.json --noEmit && \
	 cd services/main_server && NODE_ENV=production pnpm exec tsc --noEmit && \
	 cd ../game_service && NODE_ENV=production pnpm exec tsc --noEmit && \
	 cd ../matchmaking_service && NODE_ENV=production pnpm exec tsc --noEmit && \
	 cd ../user_service && NODE_ENV=production pnpm exec tsc --noEmit && \
	 cd ../remote_service && NODE_ENV=production pnpm exec tsc --noEmit) > $(BACKEND_LOG) 2>&1; \
	if [ $$? -eq 0 ]; then \
		echo "✅ All backend checks passed"; \
	else \
		echo "❌ Backend check(s) failed, see $(BACKEND_LOG) for details"; \
	fi

test-front:
	@echo "Testing frontend..."
	@(cd frontend && NODE_ENV=production pnpm tsc --noEmit && \
	  cd frontend && NODE_ENV=production pnpm exec vite build --dry-run) > $(FRONTEND_LOG) 2>&1; \
	if [ $$? -eq 0 ]; then \
		echo "✅ All frontend checks passed"; \
	else \
		echo "❌ Frontend check(s) failed, see $(FRONTEND_LOG) for details"; \
	fi

test-lint:
	@echo "Running linting checks..."
	@(cd frontend && NODE_ENV=production pnpm exec eslint . --max-warnings=0) > $(ESLINT_LOG) 2>&1; \
	if [ $$? -eq 0 ]; then \
		echo "✅ All linting checks passed"; \
	else \
		echo "❌ Linting check(s) failed, see $(ESLINT_LOG) for details"; \
	fi

.PHONY: dev-up dev-down dev-ps dev-logs
.PHONY: prod-up prod-down prod-ps prod-logs
.PHONY: all re clean fclean nuke test
