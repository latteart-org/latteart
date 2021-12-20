FROM node:lts-alpine

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ENV HTTP_PROXY ${HTTP_PROXY}
ENV HTTPS_PROXY ${HTTPS_PROXY}
ENV NO_PROXY ${NO_PROXY}
ENV http_proxy ${HTTP_PROXY}
ENV https_proxy ${HTTPS_PROXY}
ENV no_proxy ${NO_PROXY}

WORKDIR /usr/src/app

RUN apk update && \
    apk add git && \
    apk add python make g++

# Package 'LatteArt'
COPY *.js ./
COPY *.json ./
COPY src/ ./src/
COPY tests/ ./tests/
COPY templates/ ./templates/
COPY public/ ./public/
COPY yarn.lock ./
COPY launch/ ./launch/
RUN yarn install
RUN yarn build:viewer
RUN yarn build:viewer:history
RUN yarn package:win
# RUN yarn package:mac

CMD [ "sh", "-c", "cp -rp ./dist/latteart ./data && cp -rp ./history-viewer ./data/history-viewer && cp -rp ./snapshot-viewer ./data/snapshot-viewer"]
