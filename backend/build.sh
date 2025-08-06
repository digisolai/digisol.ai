#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements_render.txt

# Collect static files
python manage.py collectstatic --noinput

# Run database migrations
python manage.py migrate --settings=digisol_ai.settings_production

# Create superuser if needed (optional)
# python manage.py createsuperuser --noinput --settings=digisol_ai.settings_production 