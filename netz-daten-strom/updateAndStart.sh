#!/bin/bash
git pull
git checkout origin/master
mongod &
mongorestore -d deployd mongo_db_dump/deployd/
sleep 1
dpd --dbname deployd --host localhost --mongoPort 27017
