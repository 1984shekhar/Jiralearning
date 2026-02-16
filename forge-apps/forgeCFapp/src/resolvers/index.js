import Resolver from '@forge/resolver';
import { asApp, requestJira, route } from '@forge/api';

const resolver = new Resolver();

resolver.define('getText', async (req) => {
  console.log('Request context:', req.context);
  
  try {
    const { accountId, siteUrl } = req.context;
    
    // Get current user info
    var bodyData = `{
  "updates": [
    {
      "issueIds": [
        10284
      ],
      "value": "new value 2"
    }
  ]
}`;

    const response = await asApp().requestJira(route`/rest/api/3/app/field/customfield_10195/value`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    });

    console.log(`Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const responseText = await response.text();
      console.log('Response body:', responseText);
      return responseText;
    }

    // Check if response has content before parsing as JSON
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || !contentLength) {
      console.log('Empty response body');
      return { success: true, message: 'Field updated successfully' };
    }

    try {
      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
    } catch (jsonError) {
      // If JSON parsing fails, return the text instead
      const responseText = await response.text();
      console.log('Response text:', responseText);
      return { success: true, message: responseText };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

resolver.define('updateCustomField', async (req) => {
  console.log('Request context:', req.context);
  console.log('Request payload:', req.payload);
  
  try {
    const { issueId, fieldId, value } = req.payload;
    
    const bodyData = `{
  "updates": [
    {
      "issueIds": [
        ${issueId}
      ],
      "value": "${value}"
    }
  ]
}`;

    const response = await asApp().requestJira(route`/rest/api/3/app/field/${fieldId}/value`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    });

    console.log(`Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const responseText = await response.text();
      console.log('Response body:', responseText);
      return {
        success: false,
        status: response.status,
        message: responseText
      };
    }

    // Check if response has content before parsing as JSON
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || !contentLength) {
      console.log('Empty response body');
      return { 
        success: true, 
        message: 'Field updated successfully' 
      };
    }

    try {
      const responseData = await response.json();
      console.log('Response data:', responseData);
      return {
        success: true,
        data: responseData
      };
    } catch (jsonError) {
      // If JSON parsing fails, return the text instead
      const responseText = await response.text();
      console.log('Response text:', responseText);
      return {
        success: true,
        message: responseText
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

export const handler = resolver.getDefinitions();
