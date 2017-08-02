FROM node:6.10.0-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY index.js /usr/src/app

EXPOSE 3000

CMD [ "node", "index" ]