import os
from app import create_app

# Get configuration from environment or default to development
config_name = os.environ.get('FLASK_CONFIG', 'development')

# Create Flask application with specified configuration
app = create_app(config_name)

# Run the application in standalone mode (for development)
if __name__ == '__main__':
    # Get port from environment or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the application
    # Use 0.0.0.0 to make the server accessible from outside the container
    app.run(host='0.0.0.0', port=port, debug=True)