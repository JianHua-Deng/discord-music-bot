# Official Node.js runtime as the base image
FROM node:24-slim

# Set working directory inside the container
WORKDIR /app

ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=true

# Copy package files first for caching dependency installs
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Run the bot
CMD [ "npm", "start" ]
