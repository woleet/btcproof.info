#!/usr/bin/env bash

set -e

cd static
npm i --production --ignore-scripts
cd ..

docker-compose build
