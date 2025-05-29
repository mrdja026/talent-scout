import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from .config import config

def create_app(config_name='default'):
    """
    Create and configure the Flask application
    
    Args:
        config_name: Configuration environment name ('development', 'production', 'testing')
    
    Returns:
        Flask application instance
    """
    # Create and configure app
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS
    CORS(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Set up logging
    setup_logging(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints/routes
    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Add index route
    @app.route('/')
    def index():
        return jsonify({
            'name': 'AI Agent Orchestration Platform API',
            'version': '0.1.0',
            'status': 'running'
        })
    
    return app

def setup_logging(app):
    """Configure application logging"""
    # Configure based on environment
    log_level = getattr(logging, app.config['LOG_LEVEL'])
    
    # Basic configuration
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Optional: Add file handler
    if not app.debug and not app.testing:
        # Create logs directory if it doesn't exist
        logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
        os.makedirs(logs_dir, exist_ok=True)
        
        # Add file handler
        log_file = os.path.join(logs_dir, 'app.log')
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        file_handler.setLevel(log_level)
        app.logger.addHandler(file_handler)
    
    app.logger.info('Application logging configured')

def register_error_handlers(app):
    """Register error handlers for the application"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad Request',
            'message': str(error)
        }), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': str(error)
        }), 404
    
    @app.errorhandler(500)
    def server_error(error):
        app.logger.error(f'Server error: {error}')
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
        }), 500
    
    app.logger.info('Error handlers registered')