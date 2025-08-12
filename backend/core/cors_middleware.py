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
            if origin:
                # Only add if not already present
                if 'Access-Control-Allow-Origin' not in response:
                    response['Access-Control-Allow-Origin'] = origin
                if 'Access-Control-Allow-Credentials' not in response:
                    response['Access-Control-Allow-Credentials'] = 'true'
                if 'Access-Control-Allow-Methods' not in response:
                    response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
                if 'Access-Control-Allow-Headers' not in response:
                    response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
        
        return response
