#!/bin/bash
# auto-reloading development server
# setting SPAMODE will run in SPA mode
# setting NODE_ENV=production will run without dev tooling

set -e
set -a
. .env
set +a
: "${APPPORT:=3000}"

REPO_DIR=${PWD##*/}

if [ "$NODE_ENV" = "production" ]; then
	if [ -n "$SPAMODE" ]; then
		npx http-server -c-1 client/ -p $APPPORT
	else
		npx nodemon server/index.js
	fi
else
	./node_modules/.bin/browser-sync start --ui-port 9001 --port 8000 --proxy localhost:$APPPORT --no-open -f dist/client &
	BSPID=$!
	echo BrowserSync PID $BSPID
	trap "kill -0 $BSPID &> /dev/null && kill $BSPID && echo sending SIGTERM to $BSPID; docker compose down" INT HUP TERM QUIT ABRT EXIT
	docker compose up -d mysql mongo valkey mongo-express --build --no-recreate
	while ! docker exec -i "$REPO_DIR-mysql-1" mysql -p$DB_ROOT_PASSWORD -h localhost -e "SELECT 1+1 as result" &> /dev/null; do
		secs="$secs."
		echo -ne "Waiting for MySQL$secs\033[K\r"
		[[ ${#secs} -ge 10 ]] && secs=""
		sleep 1
	done
	echo -e "\r\033[KMySQL is up!"
	while ! docker exec -i "$REPO_DIR-mongo-1" mongosh --quiet --eval "db.adminCommand('ping')" &> /dev/null; do
		secs="$secs."
		echo -ne "Waiting for MongoDB$secs\033[K\r"
		[[ ${#secs} -ge 10 ]] && secs=""
			sleep 1
	done
	echo -e "\r\033[KMongoDB is up!"

	if [ -n "$SPAMODE" ]; then
		echo Server in SPA mode
		(fswatch -ol 1 app/client | xargs -n1 -I{} ./tools/build.sh spa) &
		npx http-server -c-1 dist/client/ -p $APPPORT
	else
		(fswatch -ol 1 app/client | xargs -n1 -I{} ./tools/build.sh) &
		(fswatch -o1 1 app/server | xargs -n1 -I{} cp -R app/server/ dist/server/) &
		npm run nodemon
	fi
fi

