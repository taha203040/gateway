FROM kong:latest

USER root

COPY ./plugins/jwt-blacklist /usr/local/share/lua/5.1/kong/plugins/jwt-blacklist

ENV KONG_PLUGINS=bundled,jwt-blacklist

USER kong