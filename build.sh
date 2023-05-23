#!/bin/bash

set -e

if [[ -z "$1" || "$1" -ne spa ]]; then
	echo Full build
	cp -R app/src/ dist/src/
	mkdir dist/views; cp app/views/* dist/views/
else
	echo SPA build
fi
cp app/public/* dist/public/ 2> /dev/null || :
cp -R app/public/images dist/public/
