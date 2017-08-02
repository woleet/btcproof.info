#!/usr/bin/env bash

cd static
npm i --silent
cd ..

docker-compose build