# Gunakan base image Node.js
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
RUN npm audit fix || (echo "Audit fix failed, continuing..." && true)
COPY . .
EXPOSE 8570
CMD [ "node", "index.js" ]