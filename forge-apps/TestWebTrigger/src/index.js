/**
 * Webtrigger handler for the 'example' webtrigger
 * Handles GET and POST requests
 */
export async function myfunction(req) {
  let parsedBody = null;
  
  // Parse JSON body if present
  if (req.body) {
    try {
      parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      // If parsing fails, keep original body
      parsedBody = req.body;
    }
  }
  
  console.log('Webtrigger request received:', {
    method: req.method,
    path: req.path,
    bodyParsed: parsedBody,
  });

  // GET handler
  if (req.method === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'GET request successful',
        timestamp: new Date().toISOString(),
      }),
    };
  }

  // POST handler
  if (req.method === 'POST') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'POST request successful',
        receivedData: parsedBody,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  // Unsupported method
  return {
    statusCode: 405,
    body: JSON.stringify({
      error: 'Method not allowed',
      method: req.method,
    }),
  };
}
