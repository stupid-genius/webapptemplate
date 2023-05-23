#!/bin/bash
# auto-reloading development server

set -e
set -a
. .env
set +a
APPPORT=3000

./node_modules/.bin/browser-sync start --port 9000 --proxy localhost:$APPPORT --no-open -f dist/public &
BSPID=$!
echo BrowserSync PID $BSPID
if [[ -z "$1" || "$1" -ne spa ]]; then
	npm run nodemon
else
	echo Server in SPA mode
	# node esbuild.mjs watch serve i
	# ESPID=$!
	# echo esbuild PID $ESPID

	(fswatch -ol 1 app/public | xargs -n1 -I{} ./build.sh spa) &
	npx http-server dist/public/ -p $APPPORT
fi
# trap "kill $BSPID $ESPID" EXIT INT HUP TERM QUIT ABRT
