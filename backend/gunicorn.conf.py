"""
Gunicorn configuration file for production deployment
"""

import multiprocessing
import os

# Server socket
bind = os.environ.get('GUNICORN_BIND', '0.0.0.0:8000')
backlog = 2048

# Worker processes (optimized for Render free tier)
workers = 1  # Use only 1 worker for free tier to save memory
worker_class = 'sync'
worker_connections = 50  # Reduced for memory efficiency
max_requests = 100  # Restart workers more frequently
max_requests_jitter = 10
timeout = 60  # Increased timeout for slower free tier
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
preload_app = True

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = 'digisol_ai'

# Server mechanics
daemon = False
pidfile = '/tmp/gunicorn.pid'
user = None
group = None
tmp_upload_dir = None

# SSL (if using SSL termination at Gunicorn level)
# keyfile = '/path/to/keyfile'
# certfile = '/path/to/certfile'

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Performance
worker_tmp_dir = '/dev/shm' 