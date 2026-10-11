"""Vercel Serverless Function Entry Point for Atmos Meteorological Platform.

Exports the Flask `app` WSGI instance for Vercel Serverless Functions.
"""
import os
import sys

# Add repository root to system path so all local modules and assets resolve
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app

