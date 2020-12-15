FROM node:10
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
ENV PORT=8000
ENV GOOGLE_APPLICATION_CREDENTIALS='./docker-b37e8518b451.json'
EXPOSE ${PORT}
CMD ["npm", "start"]