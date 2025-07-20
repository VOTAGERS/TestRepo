# Gunakan base image Node.js
FROM node:24.1.0-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
RUN npm audit fix --force
COPY . .
EXPOSE 8570
CMD [ "node", "index.js" ]