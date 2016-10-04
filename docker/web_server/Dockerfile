FROM node:latest

RUN mkdir /src

RUN npm install nodemon -g

WORKDIR /src
ADD app/package.json /src/package.json
RUN npm install

ADD app/nodemon.json /src/nodemon.json

EXPOSE 4201

CMD npm start