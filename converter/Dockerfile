# The converter service: Node plus LibreOffice. Built with this folder as the build context.
FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends libreoffice-impress libreoffice-writer fonts-liberation fonts-dejavu-core fonts-noto-core \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server.js ./
USER node
CMD ["node", "server.js"]
