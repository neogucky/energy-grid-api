#!/bin/bash
git pull
git checkout origin/master
mongod &
sleep 3
mongorestore -d deployd mongo_db_dump/deployd/
sleep 3
dpd --dbname deployd --host localhost --mongoPort 27017
