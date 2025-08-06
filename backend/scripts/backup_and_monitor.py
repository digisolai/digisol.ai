#!/usr/bin/env python3
"""
DigiSol.AI Backup and Monitoring Script
This script handles database backups and system monitoring
"""

import os
import sys
import subprocess
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
import psutil
import requests
from django.core.management import execute_from_command_line

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/backup_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class BackupMonitor:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent.parent
        self.backup_dir = self.base_dir / 'backups'
        self.backup_dir.mkdir(exist_ok=True)
        
        # Load environment variables
        self.load_environment()
    
    def load_environment(self):
        """Load environment variables from env.production"""
        env_file = self.base_dir / 'env.production'
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key] = value
    
    def create_database_backup(self):
        """Create a database backup"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = self.backup_dir / f'db_backup_{timestamp}.sql'
            
            # Get database configuration from environment
            db_name = os.environ.get('DB_NAME', 'digisol_ai_prod')
            db_user = os.environ.get('DB_USER', 'digisol_user')
            db_password = os.environ.get('DB_PASSWORD', '')
            db_host = os.environ.get('DB_HOST', 'localhost')
            db_port = os.environ.get('DB_PORT', '5432')
            
            # Create PostgreSQL backup
            if db_password:
                env = os.environ.copy()
                env['PGPASSWORD'] = db_password
                
                cmd = [
                    'pg_dump',
                    '-h', db_host,
                    '-p', db_port,
                    '-U', db_user,
                    '-d', db_name,
                    '-f', str(backup_file),
                    '--verbose'
                ]
                
                result = subprocess.run(cmd, env=env, capture_output=True, text=True)
                
                if result.returncode == 0:
                    logger.info(f"Database backup created: {backup_file}")
                    
                    # Compress the backup
                    self.compress_backup(backup_file)
                    return True
                else:
                    logger.error(f"Database backup failed: {result.stderr}")
                    return False
            else:
                logger.error("Database password not found in environment")
                return False
                
        except Exception as e:
            logger.error(f"Error creating database backup: {e}")
            return False
    
    def compress_backup(self, backup_file):
        """Compress the backup file"""
        try:
            import gzip
            compressed_file = backup_file.with_suffix('.sql.gz')
            
            with open(backup_file, 'rb') as f_in:
                with gzip.open(compressed_file, 'wb') as f_out:
                    f_out.writelines(f_in)
            
            # Remove original file
            backup_file.unlink()
            logger.info(f"Backup compressed: {compressed_file}")
            
        except Exception as e:
            logger.error(f"Error compressing backup: {e}")
    
    def cleanup_old_backups(self, days_to_keep=7):
        """Remove backups older than specified days"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            deleted_count = 0
            
            for backup_file in self.backup_dir.glob('db_backup_*.sql.gz'):
                if backup_file.stat().st_mtime < cutoff_date.timestamp():
                    backup_file.unlink()
                    deleted_count += 1
                    logger.info(f"Deleted old backup: {backup_file}")
            
            logger.info(f"Cleaned up {deleted_count} old backups")
            
        except Exception as e:
            logger.error(f"Error cleaning up old backups: {e}")
    
    def check_system_health(self):
        """Check system health metrics"""
        try:
            health_data = {
                'timestamp': datetime.now().isoformat(),
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent,
                'load_average': psutil.getloadavg() if hasattr(psutil, 'getloadavg') else None,
            }
            
            # Check if metrics are within acceptable ranges
            warnings = []
            if health_data['cpu_percent'] > 80:
                warnings.append(f"High CPU usage: {health_data['cpu_percent']}%")
            if health_data['memory_percent'] > 85:
                warnings.append(f"High memory usage: {health_data['memory_percent']}%")
            if health_data['disk_percent'] > 90:
                warnings.append(f"High disk usage: {health_data['disk_percent']}%")
            
            if warnings:
                logger.warning(f"System health warnings: {', '.join(warnings)}")
            else:
                logger.info("System health is good")
            
            return health_data
            
        except Exception as e:
            logger.error(f"Error checking system health: {e}")
            return None
    
    def check_application_health(self):
        """Check application health via health endpoint"""
        try:
            health_url = "http://localhost:8000/health/"
            response = requests.get(health_url, timeout=10)
            
            if response.status_code == 200:
                health_data = response.json()
                logger.info("Application health check passed")
                return health_data
            else:
                logger.error(f"Application health check failed: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error checking application health: {e}")
            return None
    
    def check_docker_services(self):
        """Check Docker services status"""
        try:
            result = subprocess.run(
                ['docker-compose', 'ps'],
                capture_output=True,
                text=True,
                cwd=self.base_dir
            )
            
            if result.returncode == 0:
                logger.info("Docker services status:")
                for line in result.stdout.split('\n'):
                    if line.strip() and not line.startswith('Name'):
                        logger.info(f"  {line}")
                return True
            else:
                logger.error(f"Error checking Docker services: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error checking Docker services: {e}")
            return False
    
    def run_migrations(self):
        """Run database migrations"""
        try:
            logger.info("Running database migrations...")
            
            # Change to the Django project directory
            os.chdir(self.base_dir)
            
            # Run migrations
            result = subprocess.run([
                'docker-compose', 'exec', '-T', 'web', 
                'python', 'manage.py', 'migrate', '--noinput'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("Database migrations completed successfully")
                return True
            else:
                logger.error(f"Database migrations failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error running migrations: {e}")
            return False
    
    def collect_static_files(self):
        """Collect static files"""
        try:
            logger.info("Collecting static files...")
            
            result = subprocess.run([
                'docker-compose', 'exec', '-T', 'web',
                'python', 'manage.py', 'collectstatic', '--noinput'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info("Static files collected successfully")
                return True
            else:
                logger.error(f"Static files collection failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error collecting static files: {e}")
            return False
    
    def run_maintenance(self):
        """Run complete maintenance routine"""
        logger.info("Starting maintenance routine...")
        
        # Check system health
        system_health = self.check_system_health()
        
        # Check application health
        app_health = self.check_application_health()
        
        # Check Docker services
        docker_status = self.check_docker_services()
        
        # Create backup
        backup_success = self.create_database_backup()
        
        # Cleanup old backups
        self.cleanup_old_backups()
        
        # Run migrations
        migrations_success = self.run_migrations()
        
        # Collect static files
        static_success = self.collect_static_files()
        
        # Summary
        logger.info("Maintenance routine completed")
        logger.info(f"  - System health: {'Good' if system_health else 'Failed'}")
        logger.info(f"  - Application health: {'Good' if app_health else 'Failed'}")
        logger.info(f"  - Docker services: {'Good' if docker_status else 'Failed'}")
        logger.info(f"  - Database backup: {'Success' if backup_success else 'Failed'}")
        logger.info(f"  - Migrations: {'Success' if migrations_success else 'Failed'}")
        logger.info(f"  - Static files: {'Success' if static_success else 'Failed'}")

def main():
    """Main function"""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        monitor = BackupMonitor()
        
        if command == 'backup':
            monitor.create_database_backup()
        elif command == 'health':
            monitor.check_system_health()
            monitor.check_application_health()
        elif command == 'docker':
            monitor.check_docker_services()
        elif command == 'migrate':
            monitor.run_migrations()
        elif command == 'static':
            monitor.collect_static_files()
        elif command == 'maintenance':
            monitor.run_maintenance()
        else:
            print("Usage: python backup_and_monitor.py [backup|health|docker|migrate|static|maintenance]")
    else:
        print("Usage: python backup_and_monitor.py [backup|health|docker|migrate|static|maintenance]")

if __name__ == '__main__':
    main() 