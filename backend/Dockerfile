FROM node:20-alpine AS builder 

WORKDIR /app

COPY  package*.json ./

COPY  . .

RUN npm ci --ignore-scripts


FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app .

USER node

EXPOSE 5000

CMD ["node","src/server.js"]