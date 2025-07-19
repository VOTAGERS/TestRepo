# Gunakan base image Node.js
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install --production
COPY . .
EXPOSE 8570
CMD [ "npm", "start" ]