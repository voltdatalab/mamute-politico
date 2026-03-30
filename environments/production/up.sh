#!/bin/bash

# set -e

# Force execution from this script directory.
scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
pushd "$scriptDir"

echo "Current directory: $(pwd)"
echo "Starting Mamute Politico UI Production"

docker compose -f docker-compose.yml up -d --build
popd

