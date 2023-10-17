# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory to /usr/src/app
WORKDIR /app

RUN sudo apt install ffmpeg

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
