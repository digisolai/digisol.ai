#!/usr/bin/env python3
"""
Project Manager Test Runner
This script starts the backend and frontend servers, then runs comprehensive tests
for the project management system.
"""

import os
import sys
import time
import subprocess
import signal
import threading
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import requests
        import django
        print("✅ Dependencies check passed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install required packages:")
        print("pip install requests django")
        return False

def start_backend_server():
    """Start the Django backend server"""
    print("🚀 Starting Django backend server...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return None
    
    try:
        # Change to backend directory and start server
        process = subprocess.Popen(
            ["python", "manage.py", "runserver", "8000"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a bit for server to start
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ Backend server started on http://localhost:8000")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Backend server failed to start: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting backend server: {e}")
        return None

def start_frontend_server():
    """Start the React frontend server"""
    print("🚀 Starting React frontend server...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return None
    
    try:
        # Check if node_modules exists
        if not (frontend_dir / "node_modules").exists():
            print("📦 Installing frontend dependencies...")
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
        
        # Start development server
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a bit for server to start
        time.sleep(5)
        
        if process.poll() is None:
            print("✅ Frontend server started on http://localhost:5173")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Frontend server failed to start: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting frontend server: {e}")
        return None

def wait_for_servers():
    """Wait for both servers to be ready"""
    import requests
    
    print("⏳ Waiting for servers to be ready...")
    
    max_attempts = 30
    attempts = 0
    
    while attempts < max_attempts:
        try:
            # Test backend
            backend_response = requests.get("http://localhost:8000/health/", timeout=5)
            if backend_response.status_code == 200:
                print("✅ Backend server is ready")
                break
        except:
            pass
        
        try:
            # Test frontend
            frontend_response = requests.get("http://localhost:5173", timeout=5)
            if frontend_response.status_code == 200:
                print("✅ Frontend server is ready")
                break
        except:
            pass
        
        attempts += 1
        time.sleep(2)
        print(f"⏳ Waiting... ({attempts}/{max_attempts})")
    
    if attempts >= max_attempts:
        print("❌ Servers did not start within expected time")
        return False
    
    return True

def run_tests():
    """Run the comprehensive project manager tests"""
    print("\n🧪 Running Project Manager Tests...")
    print("=" * 50)
    
    try:
        # Import and run the test script
        from test_project_manager import ProjectManagerTester
        
        tester = ProjectManagerTester()
        success = tester.run_all_tests()
        
        return success
        
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def cleanup_servers(backend_process, frontend_process):
    """Clean up server processes"""
    print("\n🧹 Cleaning up server processes...")
    
    if backend_process:
        try:
            backend_process.terminate()
            backend_process.wait(timeout=5)
            print("✅ Backend server stopped")
        except:
            backend_process.kill()
            print("⚠️  Backend server force killed")
    
    if frontend_process:
        try:
            frontend_process.terminate()
            frontend_process.wait(timeout=5)
            print("✅ Frontend server stopped")
        except:
            frontend_process.kill()
            print("⚠️  Frontend server force killed")

def main():
    """Main test runner function"""
    print("🎯 Project Manager Test Runner")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    backend_process = None
    frontend_process = None
    
    try:
        # Start servers
        backend_process = start_backend_server()
        if not backend_process:
            print("❌ Failed to start backend server")
            sys.exit(1)
        
        frontend_process = start_frontend_server()
        if not frontend_process:
            print("❌ Failed to start frontend server")
            sys.exit(1)
        
        # Wait for servers to be ready
        if not wait_for_servers():
            print("❌ Servers are not ready")
            sys.exit(1)
        
        # Run tests
        test_success = run_tests()
        
        # Print final results
        print("\n" + "=" * 50)
        if test_success:
            print("🎉 All tests completed successfully!")
            print("✅ Project Manager is working correctly")
        else:
            print("⚠️  Some tests failed")
            print("📄 Check project_manager_test_results.json for details")
        
        return test_success
        
    except KeyboardInterrupt:
        print("\n⚠️  Test run interrupted by user")
        return False
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False
        
    finally:
        # Always cleanup servers
        cleanup_servers(backend_process, frontend_process)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 