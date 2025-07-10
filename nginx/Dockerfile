FROM debian:bookworm

RUN apt-get update && apt-get install -y \
    nginx \
    libmodsecurity3 \
    libnginx-mod-http-modsecurity \
    modsecurity-crs \
    && rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/nginx.conf
COPY cert.pem /etc/nginx/cert.pem
COPY key.pem /etc/nginx/key.pem

COPY modsec.conf modsecurity.conf unicode.mapping /etc/modsecurity/

CMD ["nginx", "-g", "daemon off;"]
