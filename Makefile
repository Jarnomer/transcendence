COMPOSE_DEV  := docker-compose.yml
COMPOSE_PROD := docker-compose.prod.yml
DOCKER_DEV   := docker compose -f $(COMPOSE_DEV)
DOCKER_PROD  := docker compose -f $(COMPOSE_PROD)
DATABASE     := ./backend/database/data.db

RM = rm -rf

all: dev-up
dev: dep-up
prod: prod-up

dev-up:
	@$(DOCKER_DEV) up --build -d

prod-up:
	@$(DOCKER_PROD) up --build -d

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

re: clean dev

clean: dev-down prod-down

fclean: clean
	@$(DOCKER_DEV) down -v --rmi all
	@$(DOCKER_PROD) down -v --rmi all

nuke:
	@$(RM) $(DATABASE)
	@echo "Deleted database"

.PHONY: dev-up dev-down dev-ps dev-logs
.PHONY: prod-up prod-down prod-ps prod-logs
.PHONY: all re clean fclean nuke
