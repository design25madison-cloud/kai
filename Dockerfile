# The hosted version: builds the app to save through the server, then runs server/index.js.
FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN VITE_API=1 npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "server/index.js"]
