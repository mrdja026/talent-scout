import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { log } from '../vite';

// Flask API configuration
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:8000';

/**
 * Proxy middleware for forwarding requests to Flask API
 */
export function flaskProxyMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only proxy requests to Flask-specific API endpoints
  // Pattern: /api/flask/* or direct Flask endpoints like /api/workflows, /api/templates, etc.
  if (!req.path.startsWith('/api/flask') && 
      !req.path.match(/^\/api\/(workflows|templates|agents|models|executions)/)) {
    return next();
  }
  
  const url = `${FLASK_API_URL}${req.path}`;
  log(`Proxying request to Flask: ${req.method} ${url}`, 'proxy');
  
  // Forward the request to Flask
  axios({
    method: req.method,
    url,
    data: req.body,
    headers: {
      'Content-Type': 'application/json',
      // Forward authentication headers if present
      ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
    },
    responseType: 'arraybuffer' // Handle any type of response (JSON, binary, etc.)
  })
    .then((response: any) => {
      // Set response headers
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value as string);
      });
      
      // Set status code
      res.status(response.status);
      
      // Send the response
      res.send(response.data);
    })
    .catch((error: any) => {
      log(`Flask proxy error: ${error.message}`, 'proxy');
      
      // If we have a response from Flask, forward it
      if (error.response) {
        // Set response headers
        Object.entries(error.response.headers).forEach(([key, value]) => {
          res.setHeader(key, value as string);
        });
        
        // Set status code and send response
        res.status(error.response.status).send(error.response.data);
      } else {
        // Otherwise, return a generic error
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to communicate with backend API'
        });
      }
    });
}

/**
 * Start the Flask API server
 */
export function startFlaskAPI() {
  // In a production environment, we would spawn the Flask process here
  // For development, we assume the Flask API is started separately
  log('Flask API proxy initialized', 'proxy');
}