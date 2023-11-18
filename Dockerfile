
FROM node:20
WORKDIR src

# tini - for passing SIGINT interrupts
ENV TINI_VERSION v0.19.0
ENV TINI_SUBREAPER true
ADD https://github.com/krallin/tini/releases/download/$TINI_VERSION/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# dependencies
COPY package*.json .
RUN npm install

# source
COPY . .
COPY .env.local .
RUN npm run build
RUN ls -la build

ENV HOST 127.0.0.1
ENV PORT 8080

CMD [ "node", "build" ]
