# label 1st phase as builder
FROM node:alpine as builder
WORKDIR '/app'
COPY package.json ./
RUN npm install
COPY ./ ./
RUN npm run build
# content in /app/build are what we care


# 2nd FROM statement mean start a new phase
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# copy from builder phase
COPY --from=builder /app/build /usr/share/nginx/html
