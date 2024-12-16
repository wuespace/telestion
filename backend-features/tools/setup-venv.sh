#!/bin/sh

## This script creates a new and empty virtual python environment (venv)
## in which the needed packages and versions of these packages can be installed.

VENV_NAME=".venv"

script_dir="$(dirname "$(realpath "$0")")"
project_dir="$script_dir/.."

err() {
  printf 'err: %s\n' "$@"
}

if ! command -v "python3" > /dev/null 2>&1; then
  err 'This script needs Python 3. Please install Python 3 via your package manager and try again.'
  exit 1
fi

cd "$project_dir" || { err 'Project directory inaccessible'; exit 1; }

printf 'Setup virtual environment...\n'
if ! [ -d "$VENV_NAME" ]; then
  python3 -m venv "$VENV_NAME"
fi

# load venv
if ! command -v python3 2> /dev/null | grep "$VENV_NAME/bin/python3" > /dev/null 2>&1; then
  # shellcheck disable=SC1091
  . "${VENV_NAME}/bin/activate"
fi

printf 'Update installer...'
python3 -m pip install --upgrade pip

printf 'Install required python modules...\n'
pip install -r requirements.txt

printf '\n----------------------------------------------\n'
printf '\nFinished setting up Ansible environment!\n'
printf 'To use the python environment, source the activate script and you are ready to go:\n\n'
printf '$ source %s/bin/activate\n' "$VENV_NAME"
printf '\n----------------------------------------------\n\n'

