from flask import Blueprint

# Create the API blueprint
api_bp = Blueprint('api', __name__)

# Import API route modules
from . import workflows, nodes, connections, templates, files

# Register API routes (if needed)
# This will be populated automatically when the modules are imported