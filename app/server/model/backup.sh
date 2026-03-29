#!/bin/sh
# compose cluster backup script
# dev mode runs `./tools/backup.sh`

set -e
. ../../../.env

AUTH_DB="admin"
BACKUP_DIR="../../../backup/$(date +%F)/"
ARCHIVE="$BACKUP_DIR${1:$1-}"

echo "Backing up to $BACKUP_DIR (cwd: ${PWD})"
mkdir -p "$BACKUP_DIR"
echo "connecting to $DOCSHOST:$DOCSPORT"

mongodump \
  --host "$DOCSHOST" \
  --port "$DOCSPORT" \
  --username "root" \
  --password "$DOCS_ROOT_PASSWORD" \
  --authenticationDatabase "$AUTH_DB" \
  --gzip \
  --archive > "${ARCHIVE}mongo.gz"
echo "[MongoDB] Backup of ${DOCSDB:-webapptemplate} completed at $BACKUP_DIR"

mysqldump -h"$DBHOST" -P"$DBPORT" --all-databases -uroot -p"$DB_ROOT_PASSWORD" > ${ARCHIVE}mysql.sql
echo "[MySQL] Backup of all databases completed at $BACKUP_DIR"

echo Backup complete

