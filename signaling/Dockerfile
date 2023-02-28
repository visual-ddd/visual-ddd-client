FROM node:19-alpine3.16

WORKDIR /app
ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080

COPY ./package.json ./

RUN npm install

CMD ["node", "./node_modules/y-webrtc/bin/server.js"]
