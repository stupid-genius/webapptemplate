#!/bin/bash
# auto-reloading development server

set -e
set -a
. .env
set +a
APPPORT=3000

./node_modules/.bin/browser-sync start --port 9000 --proxy localhost:$APPPORT --no-open -f dist/client &
BSPID=$!
echo BrowserSync PID $BSPID
(fswatch -ol 1 app/client | xargs -n1 -I{} ./build.sh spa) &
if [[ -z "$1" || "$1" -ne spa ]]; then
	npm run nodemon
else
	echo Server in SPA mode
	# node esbuild.mjs watch serve i
	# ESPID=$!
	# echo esbuild PID $ESPID

	npx http-server dist/client/ -p $APPPORT
fi
trap "kill $BSPID $ESPID" INT HUP TERM QUIT ABRT EXIT
