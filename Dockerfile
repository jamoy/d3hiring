FROM node:14.8.0-alpine3.11
WORKDIR /usr/app
COPY ./package*.json ./
RUN apk --update add --no-cache curl git python alpine-sdk \
  bash autoconf libtool automake
RUN yarn install --production && yarn cache clean
RUN adduser -D -g '' d3hiring
COPY ./dist ./dist
EXPOSE 7002
USER d3hiring
CMD [ "node", "--max-old-space-size=512", "dist/start.js" ]