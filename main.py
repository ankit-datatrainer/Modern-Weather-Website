"""Entry point for Atmos Meteorological Platform.
Supports both standard execution and Vercel serverless deployment.
"""
from app import app

if __name__ == "__main__":
    app.run()
