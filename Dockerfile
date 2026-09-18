FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package definitions
COPY package.json ./
COPY client/package.json client/
COPY server/package.json server/

# Install dependencies
RUN npm install

# Copy source files
COPY client/ client/
COPY server/ server/

# Build client and server
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["npm", "run", "start"]
