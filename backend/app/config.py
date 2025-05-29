import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-for-development-only')
    DEBUG = False
    TESTING = False
    ENV = 'production'
    LOG_LEVEL = 'INFO'
    
    # Simulated latency settings (in seconds)
    MIN_LATENCY = 0.2
    MAX_LATENCY = 0.8
    
    # File upload settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv', 'xlsx', 'docx'}

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    ENV = 'development'
    LOG_LEVEL = 'DEBUG'
    
    # Lower latency for development
    MIN_LATENCY = 0.1
    MAX_LATENCY = 0.5

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    ENV = 'testing'
    
    # No latency for testing
    MIN_LATENCY = 0
    MAX_LATENCY = 0

class ProductionConfig(Config):
    """Production configuration"""
    # Production-specific settings would go here
    pass

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}