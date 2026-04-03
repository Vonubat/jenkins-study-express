# Use the official Node 24 lightweight image
FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json to the working directory
COPY package.json ./

# Copy the compiled code and production dependencies from our Jenkins workspace
COPY dist ./dist
COPY node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Tell Docker how to start the app
CMD ["npm", "start"]