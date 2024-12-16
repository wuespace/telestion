#!/bin/sh

script_dir="$(dirname "$(realpath "$0")")"
backend_features_dir="$script_dir/../backend-features"

. "$backend_features_dir/.venv/bin/activate"
python3 "$backend_features_dir/run-tests.py" "$script_dir"
