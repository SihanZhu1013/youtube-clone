#use an official node runtime as a parent image
#stage 1:build stage
FROM node:18 AS builder

#SET THE WORKING DIRECTORY IN THE CONTAINER TO /APP
WORKDIR /app 

#copt package.json and package-lock.json into the working directory
COPY package*.json ./

#install any needed packages specified in package.json
RUN npm install

#copy app source inside the docker image
COPY . .

#build the app
RUN npm run build

#stage 2 :production stage
FROM node:18

#install ffmpeg in the container
RUN apt-get update &&apt-get install -y ffmpeg

#set the working directoru
WORKDIR /app

#copt package.json and package-lock.json into the working directory
COPY package*.json ./

#install only production dependencies
RUN npm install --only==production

#copy built app from the builder stage
COPY --from=builder /app/dist ./dist

#MAKE port 3000 available outside this container
EXPOSE 3000

#define the command to run your app using CMD (only once CMD allowed)
CMD ["npm", "run","serve"]