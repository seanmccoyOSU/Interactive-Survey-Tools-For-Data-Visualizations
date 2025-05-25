#!/bin/sh

HOST="$1"
shift
PORT="$1"
shift

echo "Waiting for $HOST:$PORT..."

while ! nc -z "$HOST" "$PORT"; do
  sleep 1
done

echo "$HOST:$PORT is available. Starting application..."

# Run the rest of the command passed
if [ "$#" -eq 0 ]; then
  echo "Error: No command specified to run after wait"
  exit 1
fi

exec "$@"