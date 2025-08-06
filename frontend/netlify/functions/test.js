exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Netlify Function is working!',
      timestamp: new Date().toISOString(),
      environment: {
        BACKEND_URL: process.env.BACKEND_URL || 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
      },
      event: {
        path: event.path,
        httpMethod: event.httpMethod,
        headers: event.headers
      }
    })
  };
};