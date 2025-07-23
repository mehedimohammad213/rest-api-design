# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Expose the port (default 3006, can be overridden by env)
EXPOSE 3006

# Start the application
CMD ["yarn", "start"]