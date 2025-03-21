FROM node:gallium-alpine
WORKDIR /opt/webapptemplate
ENV NODE_ENV=production
COPY dist/ tools/serve.sh .
RUN npm ci
EXPOSE 3000
CMD ["sh", "serve.sh"]
