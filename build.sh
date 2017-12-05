#!/usr/bin/env bash

cd static
npm update --silent
cd ..

docker-compose build