FROM node:14-alpine AS build

# Initialize working directory
WORKDIR /usr/src/app

# Prepare for installing dependencies
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ["package.json", "yarn.lock", "./"]

# Install dependencies
RUN yarn --frozen-lockfile

# Set env to production
ENV NODE_ENV production

# Copy the rest files
COPY . .

# Build applciation
RUN yarn build

# Expose listening port
EXPOSE 3000

# Starting scripts
CMD yarn start:prod

