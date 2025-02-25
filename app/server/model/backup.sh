#!/bin/sh
# /var/app/current/db/data/

. ../../../.env
docker exec webapptemplate-mysql-1 sh -c 'exec mysqldump --all-databases -uroot -p'"$DB_ROOT_PASSWD" > $1
echo Backup exited with $?
