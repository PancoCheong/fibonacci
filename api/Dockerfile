FROM node:alpine
EXPOSE 5000
WORKDIR '/app'

COPY ./package.json ./
RUN npm install

COPY ./ ./
# use nodemon
CMD ["npm", "run", "start"]
