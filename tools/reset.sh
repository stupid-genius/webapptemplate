#!/bin/bash
# Reset the data

cd "$(dirname "$0")"
read -p "This will delete all data.  Are you sure?  Enter 'yes' to continue: " confirm
if [ "$confirm" != "yes" ]; then
  echo Cancelled
  exit 1
fi

echo Resetting databases...
rm -rf ../db/data
rm -rf ../docs/data
rm -rf ../grafana/data
rm -rf ../prometheus/data

