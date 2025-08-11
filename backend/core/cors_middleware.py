"""
Custom CORS middleware to ensure proper CORS headers are set.
"""

class CustomCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Always add CORS headers for API endpoints
        if request.path.startswith('/api/'):
            origin = request.META.get('HTTP_ORIGIN')
            
            # Check if origin is in allowed origins
            allowed_origins = [
                'https://digisolai.ca',
                'https://www.digisolai.ca', 
                'https://digisolai.netlify.app',
                'http://localhost:3000',
                'http://localhost:5173'
            ]
            
            # Add CORS headers for ALL responses, regardless of status code
            if origin in allowed_origins:
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
                response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
                response['Access-Control-Max-Age'] = '86400'
            
            # Also handle preflight requests
            if request.method == 'OPTIONS':
                response['Access-Control-Allow-Origin'] = origin if origin in allowed_origins else ''
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
                response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
                response['Access-Control-Max-Age'] = '86400'
        
        return response
