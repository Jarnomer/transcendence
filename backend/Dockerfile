FROM node:22-slim

#RUN apt-get update && apt-get install -y passwd
WORKDIR /app
COPY  . /app/.

#RUN useradd -m appuser
#RUN chown -R appuser:appuser /app/
#USER appuser

RUN npm install

CMD ["npm", "run", "dev", "--", "--host"]
