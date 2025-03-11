FROM nginx

# RUN apt-get update && apt-get install -y \
#     libmodsecurity3 \
#     libnginx-mod-http-modsecurity \
#     git \
#     && rm -rf /var/lib/apt/lists/*

# RUN mkdir /etc/nginx/modsec && \
#     git clone https://github.com/coreruleset/coreruleset.git /etc/nginx/modsec/coreruleset

COPY nginx.conf /etc/nginx/nginx.conf
# COPY cert.pem /etc/nginx/cert.pem
# COPY key.pem /etc/nginx/key.pem
# COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf

