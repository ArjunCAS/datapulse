#!/bin/sh

echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done

echo "PostgreSQL port is open. Waiting for it to be ready..."
sleep 3

python manage.py migrate --noinput

python manage.py seed_data

exec "$@"
