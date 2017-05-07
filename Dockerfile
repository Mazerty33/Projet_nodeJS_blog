FROM node:alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app

USER node
EXPOSE 8088
CMD [ "node", "." ]
