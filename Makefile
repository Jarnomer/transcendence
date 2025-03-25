COMPOSE_FILE   := docker-compose.yml
DOCKER_COMPOSE := docker compose -f $(COMPOSE_FILE)
DATABASE       := ./backend/database/data.db

RM = rm -rf

all: up

up:
	@$(DOCKER_COMPOSE) up --build -d

down:
	@$(DOCKER_COMPOSE) down

re: clean up

clean: down

fclean: clean
	@$(DOCKER_COMPOSE) down -v --rmi all

nuke:
	@$(RM) $(DATABASE)

ps:
	@$(DOCKER_COMPOSE) ps

logs:
	@$(DOCKER_COMPOSE) logs

.PHONY: all up down re clean fclean nuke ps logs
