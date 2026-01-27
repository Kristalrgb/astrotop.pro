FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build NestJS app
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run compiled app
CMD ["npm", "run", "start:prod"]

