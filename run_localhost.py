#!/usr/bin/env python3
"""
Local development server for AcademicBot
Run this file to start the application on localhost
"""

from app import app
import os

if __name__ == '__main__':
    print("Starting AcademicBot on localhost...")
    print("Open your browser and go to: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    
    # Run on localhost for development
    app.run(
        host='127.0.0.1',  # localhost only
        port=5000,
        debug=True,
        use_reloader=True
    )