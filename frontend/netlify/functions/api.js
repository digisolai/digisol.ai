const axios = require('axios');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    };
  }

  // Get the path from the request
  const path = event.path.replace('/.netlify/functions/api', '');
  
  // Backend URL - you can change this to your deployed backend
  const BACKEND_URL = process.env.BACKEND_URL || 'https://digisol-backend.onrender.com';
  
  console.log('Netlify Function called:', {
    path,
    method: event.httpMethod,
    BACKEND_URL,
    fullUrl: `${BACKEND_URL}${path}`
  });
  
  try {
    const response = await axios({
      method: event.httpMethod.toLowerCase(),
      url: `${BACKEND_URL}${path}`,
      data: event.body ? JSON.parse(event.body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': event.headers.authorization,
        ...event.headers
      },
      params: event.queryStringParameters
    });
    
    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    };
  } catch (error) {
    console.error('API Proxy Error:', error.response?.data || error.message);
    
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: error.response?.data || error.message,
        path: path,
        method: event.httpMethod
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    };
  }
}; 