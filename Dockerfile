# Official Node.js runtime as the base Image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first for caching dependency installs
COPY package*.json ./

# Copy the .env file
COPY .env ./

# Install dependencies
RUN npm install

# Copy the rest of applicaiton codes
COPY . .

# Run the bot
CMD [ "node", "index.js" ]