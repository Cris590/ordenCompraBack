# Etapa de construcción
FROM node:20-alpine AS build
WORKDIR /usr/src/app
# Install app dependencies based on package-lock.json
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa final con Puppeteer y Chromium
FROM node:20-alpine
WORKDIR /usr/src/app/

# Instalar dependencias para Puppeteer y Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    tzdata \
    && cp /usr/share/zoneinfo/America/Bogota /etc/localtime \
    && echo "America/Bogota" > /etc/timezone

# Establecer variables de entorno para Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json .
RUN npm install
RUN npm install knex -g
COPY knexfile.ts .

RUN mkdir -p /usr/src/app/documents_storage/storage && \
    chown -R node:node /usr/src/app/documents_storage/storage

COPY --from=build /usr/src/app/dist/. /usr/src/app/dist/
COPY --from=build /usr/src/app/assets /usr/src/app/assets/
COPY --from=build /usr/src/app/templates /usr/src/app/templates/
# COPY --from=build /usr/src/app/documents_storage/storage /usr/src/app/documents_storage/storage/

RUN mkdir -p /usr/src/app/dist/uploads && \
    chown -R node:node /usr/src/app/dist/uploads

EXPOSE 3000

CMD ["npm", "start"]
