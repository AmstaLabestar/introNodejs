# dockerfile for building the image of the application

FROM node:18-alpine

# set the working directory
WORKDIR /app

# copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# install the dependencies
RUN npm install

# copy the rest of the application code to the working directory    
COPY . .

# build the application
RUN npm run build

#  Nginx to serve the built application
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# expose the port that the application will run on
EXPOSE 80

# start the application
CMD ["nginx", "-g", "daemon off;"]
