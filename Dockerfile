# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the Node.js application's dependencies
RUN npm install

# Copy the application files to the working directory
COPY . .

# Expose the port that the application will run on
EXPOSE 3000

# Define the command to run your Node.js application
CMD [ "node", "index.js" ]
