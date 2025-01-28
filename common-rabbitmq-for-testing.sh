#!/usr/bin/env bash

docker run -d --hostname my-rabbitmq --name my-rabbitmq -p 5672:5672 -e RABBITMQ_DEFAULT_USER=root -e RABBITMQ_DEFAULT_PASS=root rabbitmq:3-management
