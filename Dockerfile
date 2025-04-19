FROM node:iron-alpine
WORKDIR /opt/webapptemplate
ENV NODE_ENV=production
COPY dist/ tools/serve.sh .
RUN npm ci
ARG APPPORT=3000
ENV APPPORT=${APPPORT}
EXPOSE ${APPPORT}
CMD ["sh", "serve.sh"]
