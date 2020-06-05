### STAGE 1: Build ###
FROM node:12.7-alpine AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run buildprod

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY conf /etc/nginx
COPY --from=build /usr/src/app/dist/wordzz-front /usr/share/nginx/html
