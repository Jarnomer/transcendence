FROM nginx:alpine

RUN apk update && apk add  openssl
RUN addgroup -g 1001 nginxgroup \
    && adduser -D -u 1001 -G nginxgroup nginxuser

RUN mkdir -p /etc/nginx/ssl
RUN openssl req -x509 -nodes \
-out /etc/nginx/ssl/certificate.crt \
-keyout /etc/nginx/ssl/certificate.key \
-subj "/CN=localhost"

COPY nginx.conf /etc/nginx/nginx.conf

RUN chown -R nginxuser:nginxgroup /var/cache/nginx /var/run /etc/nginx /usr/share/nginx/html 
USER nginxuser

EXPOSE 8443
CMD ["nginx", "-g", "daemon off;"]