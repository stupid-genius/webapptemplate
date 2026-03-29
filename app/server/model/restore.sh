#!/bin/sh
# compose cluster restore script
# dev mode runs `./tools/restore.sh`
# first arg must be date format YYYY-MM-DD
# optional second arg is the backup name

set -e
. ../../../.env

AUTH_DB="admin"
BACKUP_DIR="../../../backup/$1/"
ARCHIVE="$BACKUP_DIR${2:$2-}"

echo "Restoring from $BACKUP_DIR"
echo "connecting to $DOCSHOST:$DOCSPORT"

mongorestore \
  --host "$DOCSHOST" \
  --port "$DOCSPORT" \
  --username "root" \
  --password "$DOCS_ROOT_PASSWORD" \
  --authenticationDatabase "$AUTH_DB" \
  --db "${DOCSDB:-webapptemplate}" \
  --gzip \
  --drop \
  --archive < "${ARCHIVE}mongo.gz"
echo "[MongoDB] Restore of ${DOCSDB:-webapptemplate} completed from $BACKUP_DIR"
mongorestore \
  --host "$DOCSHOST" \
  --port "$DOCSPORT" \
  --username "root" \
  --password "$DOCS_ROOT_PASSWORD" \
  --authenticationDatabase "$AUTH_DB" \
  --db "$AUTH_DB" \
  --gzip \
  --drop \
  --archive < "${ARCHIVE}mongo.gz"
echo "[MongoDB] Restore of $AUTH_DB completed from $BACKUP_DIR"

# mysql -h"$DBHOST" -P"$DBPORT" -uroot -p"$DB_ROOT_PASSWORD" < "${ARCHIVE}mysql.sql"
# echo "[MySQL] Restore of all databases completed from $BACKUP_DIR"

echo Restore complete

