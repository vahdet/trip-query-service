FROM node:lts-alpine AS build_stage
WORKDIR /usr/src/app
COPY package*.json .
COPY tsconfig.json .
RUN npm i
COPY . .
RUN npm run build

FROM node:lts-alpine
LABEL maintainer="<Vahdet Keskin> vahdetkeskin@gmail.com"
WORKDIR /usr/src/app
COPY package*.json .
COPY tsconfig.json .
RUN npm ci --only=production
COPY --from=build_stage /usr/src/app/dist ./dist
EXPOSE 8080
CMD ["npm", "start"]