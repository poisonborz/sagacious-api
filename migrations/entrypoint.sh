#!/bin/bash

if [[ $DBNAME = "sagacious" ]]
then
     echo -e "Running migrations locally when DBNAME=sagacious is not allowed."
     exit 1
else
    exec /flyway/flyway "$@"
fi
