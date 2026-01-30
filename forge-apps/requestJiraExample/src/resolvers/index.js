import Resolver from '@forge/resolver';
import { asUser, requestJira, route } from '@forge/api';
const resolver = new Resolver();

resolver.define('getText', async (req) => {
  console.log('Request context:', req.context);
  
  try {
    const { accountId, siteUrl } = req.context;
    
    // Get current user info
    const userResponse = await asUser().requestJira(route`/rest/api/3/myself`);
    
    console.log('Response status:', userResponse.status);
    console.log('Response statusText:', userResponse.statusText);
    
    const responseText = await userResponse.text();
    console.log('Response body:', responseText);
    
    return responseText;
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

export const handler = resolver.getDefinitions();
