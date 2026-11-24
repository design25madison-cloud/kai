# The converter service: Node plus LibreOffice. Built with this folder as the build context.
FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends libreoffice-impress libreoffice-writer fonts-liberation fonts-dejavu-core fonts-noto-core \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# The brand typefaces, so a deck converted to PDF shows them instead of a stand-in font.
COPY fonts.txt fonts.mjs ./
RUN node fonts.mjs fonts.txt /usr/share/fonts/truetype/kai && fc-cache -f

COPY server.js ./
USER node
CMD ["node", "server.js"]
