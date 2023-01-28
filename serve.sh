#!/bin/bash
# auto-reloading development server

set -e
set -a
. .env
set +a
APPPORT=3000

./node_modules/.bin/webpack --config-name full --watch &
WPPID=$!
./node_modules/.bin/browser-sync start --port 9000 --proxy localhost:$APPPORT --no-open -f app/** &
BSPID=$!
echo Webpack PID $WPPID $'\n' BrowserSync PID $BSPID
# trap "kill $BSPID $WPPID" EXIT
NODE_ENV=development npm run nodemon
