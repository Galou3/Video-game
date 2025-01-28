#!/usr/bin/env bash

docker network create test_network

docker run -d --name mongo_test -p 27017:27017 --network test_network -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=root mongo
