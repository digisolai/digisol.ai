"""
Simple CORS middleware to ensure CORS headers are always present.
"""

class CustomCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add CORS headers for API endpoints if they're missing
        if request.path.startswith('/api/'):
            origin = request.META.get('HTTP_ORIGIN')
            print(f"CORS Middleware: Request to {request.path} from origin {origin}")
            
            if origin:
                # Always set CORS headers for API endpoints
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
                response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, access-control-request-method, access-control-request-headers, cache-control, pragma, expires'
                
                # Handle preflight requests
                if request.method == 'OPTIONS':
                    response['Access-Control-Max-Age'] = '86400'
                    print(f"CORS Middleware: Handled OPTIONS request for {request.path}")
            
            print(f"CORS Middleware: Response headers: {dict(response.headers)}")
        
        return response
