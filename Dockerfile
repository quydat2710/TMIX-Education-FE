# ── Stage 1: Build ──
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Use docker-specific env for build
COPY .env.docker .env.production
RUN npm run build

# ── Stage 2: Serve with Nginx ──
FROM nginx:alpine

COPY --from=builder /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .

EXPOSE 3000

ENTRYPOINT ["nginx", "-g", "daemon off;"]