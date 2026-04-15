FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# .env is dockerignored; Vite inlines VITE_* at build time — pass via --build-arg.
ARG VITE_BASE_URL
ARG VITE_GHOST_JWKS

ENV VITE_BASE_URL=$VITE_BASE_URL \
    VITE_GHOST_JWKS=$VITE_GHOST_JWKS

RUN npm run build

FROM caddy:2-alpine AS runtime

WORKDIR /srv

COPY --from=build /app/dist /srv
COPY ./ui.Caddyfile /etc/caddy/Caddyfile

EXPOSE 8080

