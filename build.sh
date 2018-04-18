#!/usr/bin/env bash

cd static
npm update
cd ..

docker-compose build