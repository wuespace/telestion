echo "Running Tests"

FILE_DIR=$(realpath $(dirname $0))

source ~/WebstormProjects/telestion/backend-features/.venv/bin/activate
set -x
echo "File Dir: $FILE_DIR"
python ~/WebstormProjects/telestion/backend-features/run-tests.py "$FILE_DIR"
