"""
Specialized CORS middleware for token endpoints.
This middleware ensures CORS headers are always present for authentication endpoints.
"""

class TokenCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Specifically handle token endpoints
        if request.path in ['/api/accounts/token/', '/api/accounts/token/refresh/']:
            print(f"Token CORS Middleware: Processing {request.path}")
            
            # Get origin from request
            origin = request.META.get('HTTP_ORIGIN')
            print(f"Token CORS Middleware: Origin = {origin}")
            
            # Always set CORS headers for token endpoints
            if origin:
                response['Access-Control-Allow-Origin'] = origin
            else:
                response['Access-Control-Allow-Origin'] = '*'
            
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, x-digisol-admin, x-superuser-bypass'
            
            # Handle preflight requests
            if request.method == 'OPTIONS':
                response['Access-Control-Max-Age'] = '86400'
                print(f"Token CORS Middleware: Handled OPTIONS for {request.path}")
            
            print(f"Token CORS Middleware: Final headers = {dict(response.headers)}")
        
        return response
