FROM node:carbon
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server
COPY package.json /usr/src/server
RUN npm install
COPY . /usr/src/server
EXPOSE 3001
CMD ["npm", "start"]