FROM node:iron-alpine
WORKDIR /opt/webapptemplate
ENV NODE_ENV=production
COPY dist/ tools/serve.sh .env .
RUN npm ci --omit=dev
ARG APPPORT=3000
ENV APPPORT=${APPPORT}
EXPOSE ${APPPORT}
CMD ["sh", "serve.sh"]
