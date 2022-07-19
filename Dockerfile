FROM node:16-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

ENV BOT_TOKEN=
ENV WEBHOOK_PATH /secret-path
ENV WEBHOOK_PORT 5000

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

COPY . .

RUN \
    apt-get update && \
    apt-get install -yq --no-install-recommends \
        dumb-init \
    ; \
    apt-get install -yq --no-install-recommends \
        ca-certificates fonts-liberation wget xdg-utils \
        libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 \
        libexpat1 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 \
        libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 \
    ; \
    rm -rf /var/lib/apt/lists/*

EXPOSE 5000

CMD [ "npm", "run", "start:webhook" ]