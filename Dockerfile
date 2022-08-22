FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "yarn.lock", "npm-shrinkwrap.json*", "./"]
RUN yarn install --silent && yarn run build
COPY . .
EXPOSE 4000
RUN chown -R node /usr/src/app
USER node
CMD ["yarn", "start"]