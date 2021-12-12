FROM node:gallium-alpine
WORKDIR /opt/webapptemplate
COPY build/ .
RUN npm i
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]

