FROM node:22-slim

WORKDIR /app
#RUN apt-get update && apt-get install -y passwd
RUN npm install -g pnpm@latest-10
# Set CI to true to disable interactive prompts
ENV CI=true

COPY  . /app/.

#RUN useradd -m appuser
#RUN chown -R appuser:appuser /app/
#USER appuser

RUN pnpm install --recursive

CMD ["pnpm", "run", "dev", "--", "--host"]
