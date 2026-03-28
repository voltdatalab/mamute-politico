FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2-alpine AS runtime

WORKDIR /srv

COPY --from=build /app/dist /srv
COPY ./environments/production/ui.Caddyfile /etc/caddy/Caddyfile

EXPOSE 8080

