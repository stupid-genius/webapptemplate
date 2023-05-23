#!/bin/bash

set -e

echo Build start
echo esbuild
node esbuild.mjs
if [[ -z "$1" || "$1" -ne spa ]]; then
	echo Full build
	cp -R app/src/ dist/src/
	cp -R app/views/ dist/views/
else
	echo SPA build
fi
cp app/public/* dist/public/ 2> /dev/null || :
cp -R app/public/images dist/public/
echo Build complete
