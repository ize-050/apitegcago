FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3003

# Command to run the application
CMD ["npm", "start"]
