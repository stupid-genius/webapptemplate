#!/bin/bash
# auto-reloading development server

set -e
set -a
. .env
set +a
APPPORT=3000

./node_modules/.bin/browser-sync start --port 9000 --proxy localhost:$APPPORT --no-open -f app/** &
BSPID=$!
trap "kill $BSPID" EXIT INT HUP TERM QUIT ABRT
echo BrowserSync PID $BSPID
npm run nodemon
