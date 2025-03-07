COMPOSE_FILE   := docker-compose.yml
DOCKER_COMPOSE := docker compose -f $(COMPOSE_FILE)

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

ps:
	@$(DOCKER_COMPOSE) ps

logs:
	@$(DOCKER_COMPOSE) logs

.PHONY: all up down re clean fclean ps logs