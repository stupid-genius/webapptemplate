#!/bin/bash

set -e

echo Build start
echo esbuild
node esbuild.mjs
if [[ -z "$1" || "$1" -ne spa ]]; then
	echo Full build
	cp -R app/server/ dist/server/
	cp .env dist/
else
	echo SPA build
fi
cp app/client/* dist/client/ 2> /dev/null || :
if [ -d "app/client/images" ] && [ -n "app/client/images/*" ]; then
   cp -R app/client/images dist/client/
fi
jq '{name: .name, description: .description, version: .version, dependencies: .dependencies}' package.json > dist/package.json
if [ "$NODE_ENV" = "production" ]; then
	npm --prefix dist update --package-lock-only
fi
echo Build complete
