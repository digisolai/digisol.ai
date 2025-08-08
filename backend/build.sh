#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements_render.txt

# Collect static files
python manage.py collectstatic --noinput --settings=digisol_ai.settings_render

# Run database migrations
python manage.py migrate --settings=digisol_ai.settings_render

# Create superuser if needed (optional)
# python manage.py createsuperuser --noinput --settings=digisol_ai.settings_render 