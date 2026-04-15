#!/bin/bash

set -euo pipefail

script_dir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
image_name="mamute-env-tools:local"

echo "Construindo imagem das ferramentas..."
docker build -t "$image_name" "$script_dir"

run_args=(--rm -v "$script_dir:/workspace/tools")

if [ -f "$script_dir/.env" ]; then
  run_args+=(--env-file "$script_dir/.env")
fi

docker run "${run_args[@]}" "$image_name" status
