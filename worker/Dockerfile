# worker/Dockerfile
FROM node:20-bullseye

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --production

# Install ffmpeg and fonts (ffmpeg required by Remotion when using certain codecs)
RUN apt-get update && apt-get install -y ffmpeg

# Copy rest of code (you will copy remotion code into worker during build)
COPY . .

# Install remotion globally (or your project's remotion deps)
RUN npm install -g remotion

EXPOSE 3001
CMD ["node", "server.js"]
