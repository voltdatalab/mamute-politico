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

echo "Verificando arquivos .env esperados..."
declare -a env_files=(
  "$script_dir/.env"
  "$script_dir/../../api/.env"
  "$script_dir/../../chatbot_backend/.env"
  "$script_dir/../../mamute_scrappers/.env"
  "$script_dir/../../ui/.env"
)

for env_file in "${env_files[@]}"; do
  rel_path=$(realpath --relative-to="$script_dir/../.." "$env_file" 2>/dev/null || echo "$env_file")
  if [ -f "$env_file" ]; then
    echo "[PASS] $rel_path existe"
  else
    echo "[WARN] $rel_path não existe"
  fi
done
echo ""

docker run "${run_args[@]}" "$image_name" status
