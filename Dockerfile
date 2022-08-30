FROM node:16-slim

ADD . /app
WORKDIR /app
RUN npm install
RUN npm run build

CMD [ "npm", "start" ]
