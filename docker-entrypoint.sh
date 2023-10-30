#!/bin/sh
#           :docker-entrypoint.sh
#description     :This script will run process with PM based on ENV
#author          : AdilM
#date            :20190930
#version         :0.1
#usage           :ENTRYPOINT  ["sh","docker-entrypoint.sh"]
# Prepare ffmpeg
# cp -r ../FFmpeg/. ../
# export LD_LIBRARY_PATH=/usr/local/lib/
# whereis ffmpeg

if [ "$NODE_ENV" = "development" ]; then
    # start process with pm2 in development environment to restart application on change
    # npm run build && pm2-dev ecosystem.config.js --env development --time --log-date-format && pm2 list
    pm2-dev ecosystem.config.js --env development --time
else
    # start process with node in production or any other environment
    # npm run build && pm2-runtime ecosystem.config.js --env production --time --log-date-format && pm2 list
    pm2-runtime ecosystem.config.js --env production --time
fi

# PORT=3000 npm run build && forever start --minUptime 5000 --spinSleepTime 10000 server/index.js
# npm run build && forever --append --uid cookme --fifo -l forever.log -o out.log -e err.log --minUptime 1000 --spinSleepTime 1000 server/index.js
#Replacing pm2-runtime with pm2-dev will enable the watch and restart features. This is quite interesting in a development container when the host files are exposed to the container as a VOLUME.
