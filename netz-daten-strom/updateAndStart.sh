#!/bin/bash
git pull
git checkout origin/master
mongod &
mongorestore -d deployd mongo_db_dump/deployd/ --host localhost --port 27017
sleep 3
dpd --dbname deployd --host localhost --mongoPort 27017
