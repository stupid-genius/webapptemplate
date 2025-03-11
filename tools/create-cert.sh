#!/bin/bash

cd "$(dirname "$0")"
openssl req -new -x509 -newkey rsa:2048 -keyout ../nginx/key.pem -nodes -out ../nginx/cert.pem
