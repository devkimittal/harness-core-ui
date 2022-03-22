FROM nginx:alpine
# https://github.com/nginxinc/docker-nginx/issues/640
RUN apk update
RUN apk add --upgrade libxml2 libxslt 

COPY dist /opt/nextgenui
COPY docker/entrypoint.sh /opt/
COPY docker/nginx.conf /etc/nginx/
COPY docker/nginx-ipv4-only.conf /etc/nginx/
WORKDIR /opt/nextgenui

# for on-prem
RUN addgroup -S 101 && adduser -S 101 -G 101
RUN chown -R 101:101 /opt/ /tmp
RUN chmod 700 -R /opt
RUN chmod 700 -R /tmp
USER 101
# end on-prem


EXPOSE 8080
ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
