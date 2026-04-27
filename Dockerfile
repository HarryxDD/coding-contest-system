FROM node:22.21.1-alpine

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli typescript ts-node

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
COPY ./startup.relational.dev.sh /opt/startup.relational.dev.sh
RUN chmod +x /opt/startup.relational.dev.sh
RUN sed -i 's/\r//g' /opt/startup.relational.dev.sh

RUN if [ ! -f .env ]; then cp env-example .env; fi
RUN npm run build

CMD ["/opt/startup.relational.dev.sh"]