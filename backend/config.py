import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smarttransit-super-secret-key-2025')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'smarttransit-jwt-secret-key-2025')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # SQLite Database configuration
    DB_DIR = os.path.join(BASE_DIR, 'database')
    os.makedirs(DB_DIR, exist_ok=True)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', f"sqlite:///{os.path.join(DB_DIR, 'database.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ML Models directory
    ML_MODELS_DIR = os.path.join(BASE_DIR, 'ml', 'models')
    os.makedirs(ML_MODELS_DIR, exist_ok=True)
