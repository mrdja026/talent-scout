import os
import time
import random
import uuid
from flask import request, jsonify, current_app, send_from_directory
from flask_restful import Resource, Api
from werkzeug.utils import secure_filename
from . import api_bp

# Set up API resources
api = Api(api_bp)

def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

class FileUploadResource(Resource):
    """Resource for file uploads"""
    
    def post(self):
        """Upload one or more files"""
        # Ensure upload directory exists
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Check if the post request has the file part
        if 'files' not in request.files:
            return {'error': 'No file part in the request'}, 400
        
        files = request.files.getlist('files')
        
        # If user did not select a file, the browser may submit an empty file without filename
        if not files or files[0].filename == '':
            return {'error': 'No selected file'}, 400
        
        # Process each file
        uploaded_files = []
        for file in files:
            if file and file.filename and allowed_file(file.filename):
                # Secure the filename and generate a unique name
                filename = secure_filename(file.filename)
                file_id = str(uuid.uuid4())
                unique_filename = f"{file_id}_{filename}"
                
                # Save the file
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                
                # Add file info to response
                file_info = {
                    'id': file_id,
                    'filename': filename,
                    'path': unique_filename,
                    'size': os.path.getsize(file_path),
                    'content_type': file.content_type,
                    'upload_time': time.time()
                }
                uploaded_files.append(file_info)
        
        # Simulate network delay
        delay = random.uniform(
            current_app.config['MIN_LATENCY'],
            current_app.config['MAX_LATENCY'] * 2  # Longer for file uploads
        )
        time.sleep(delay)
        
        # Check if any files were successfully uploaded
        if not uploaded_files:
            return {'error': 'No valid files uploaded'}, 400
            
        return jsonify({
            'files': uploaded_files,
            'count': len(uploaded_files),
            'message': 'Files uploaded successfully'
        }), 201

class FileResource(Resource):
    """Resource for individual file operations"""
    
    def get(self, file_id):
        """Get a specific file"""
        # Get filename from ID (would normally be stored in a database)
        files = os.listdir(current_app.config['UPLOAD_FOLDER'])
        file_path = None
        
        for file in files:
            if file.startswith(file_id):
                file_path = file
                break
        
        if file_path is None:
            return {'error': 'File not found'}, 404
            
        # Return the file
        return send_from_directory(
            current_app.config['UPLOAD_FOLDER'],
            file_path,
            as_attachment=True
        )
    
    def delete(self, file_id):
        """Delete a file"""
        # Get filename from ID (would normally be stored in a database)
        files = os.listdir(current_app.config['UPLOAD_FOLDER'])
        file_path = None
        
        for file in files:
            if file.startswith(file_id):
                file_path = file
                break
        
        if file_path is None:
            return {'error': 'File not found'}, 404
            
        # Delete the file
        os.remove(os.path.join(current_app.config['UPLOAD_FOLDER'], file_path))
        
        # Return success
        return {'message': f'File {file_id} deleted successfully'}, 200

# Register API resources
api.add_resource(FileUploadResource, '/files/upload')
api.add_resource(FileResource, '/files/<string:file_id>')