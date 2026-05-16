FROM node:20-alpine
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 4000

# Start command
CMD ["npm", "run", "dev"]
