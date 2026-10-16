# Production Dockerfile for Express.js Server
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["node", "dist/index.js"]
