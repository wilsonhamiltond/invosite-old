#!/bin/sh
#=====================================================================
# Set the following variables as per your requirement
#=====================================================================

# Database Name to backup
MONGO_DATABASE="is_patria"

# Database host name
MONGO_HOST="127.0.0.1"

# Database port
MONGO_PORT="27800"

# Backup directory
BACKUPS_DIR="/home/backups/is_patria"

# Database user name
DBUSERNAME="sa"

# Database password
DBPASSWORD="Aa@123456"

#=====================================================================
TIMESTAMP=`date +%F`
BACKUP_NAME="$MONGO_DATABASE-$TIMESTAMP"

echo "Performing backup of $MONGO_DATABASE"
echo "--------------------------------------------"

# Create backup directory
if ! mkdir -p $BACKUPS_DIR; then
 echo "Can't create backup directory in $BACKUPS_DIR. Go and fix it!" 1>&2
 exit 1;
fi;

# Create backup
mongodump --host $MONGO_HOST --port $MONGO_PORT -d $MONGO_DATABASE --username $DBUSERNAME --password $DBPASSWORD   --authenticationDatabase admin --out $BACKUPS_DIR/$BACKUP_NAME

# Compress backup
zip -r -9 $BACKUPS_DIR/$BACKUP_NAME.zip $BACKUPS_DIR/$BACKUP_NAME

# Delete uncompressed backup
rm -rf $BACKUPS_DIR/$BACKUP_NAME