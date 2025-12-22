FROM node:lts-alpine3.23

WORKDIR /app

COPY package*.json /app

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]