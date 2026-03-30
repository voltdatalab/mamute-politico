#!/bin/bash

# set -e

# Force the script to use project's root directory instead of the current working directory
# See: https://stackoverflow.com/a/24114056
scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
pushd $scriptDir
echo "Current directory: $(pwd)" && \
echo "Initializing Mamute Politico UI Development" && \
docker compose -f docker-compose.yml up --build -d && \
cd ../../ui && \
npm run dev
popd