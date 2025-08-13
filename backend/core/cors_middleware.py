"""
Aggressive CORS middleware to ensure CORS headers are always present.
"""

class CustomCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle OPTIONS requests immediately
        if request.method == 'OPTIONS':
            from django.http import HttpResponse
            response = HttpResponse(status=200)
            origin = request.META.get('HTTP_ORIGIN')
            
            if origin:
                response['Access-Control-Allow-Origin'] = origin
            else:
                response['Access-Control-Allow-Origin'] = '*'
            
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, access-control-request-method, access-control-request-headers, cache-control, pragma, expires'
            response['Access-Control-Max-Age'] = '86400'
            
            print(f"CORS Middleware: Handled OPTIONS request for {request.path}")
            return response
        
        response = self.get_response(request)
        
        # Add CORS headers for ALL API endpoints
        if request.path.startswith('/api/'):
            origin = request.META.get('HTTP_ORIGIN')
            print(f"CORS Middleware: Request to {request.path} from origin {origin}")
            
            # Always set CORS headers regardless of origin
            if origin:
                response['Access-Control-Allow-Origin'] = origin
            else:
                # If no origin header, allow all origins
                response['Access-Control-Allow-Origin'] = '*'
            
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, access-control-request-method, access-control-request-headers, cache-control, pragma, expires'
            
            print(f"CORS Middleware: Response headers: {dict(response.headers)}")
        
        return response
