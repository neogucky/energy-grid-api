#!/bin/bash
git pull
git checkout origin/master
mongorestore -d deployd mongo_db_dump/deployd/
sleep 1
dpd
