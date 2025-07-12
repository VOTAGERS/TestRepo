# Gunakan base image Node.js
FROM node:20-alpine
# Set working directory di dalam container
WORKDIR /app
# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy sisa kode aplikasi
COPY . .
# Expose port yang digunakan aplikasi Express.js
EXPOSE 8570
# Perintah untuk menjalankan aplikasi
CMD [ "npm", "start" ]