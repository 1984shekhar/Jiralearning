import Resolver from '@forge/resolver';
import api, {route} from "@forge/api";

// In-memory storage
const dataStore = {};

const resolver = new Resolver();

resolver.define('getText', async(req) => {
  console.log(req);
  try {
    var bodyData = `{
    "emailAddress": "miaa@atlassian.com",
    "products": [
      "jira-software"
    ]}`;
    const response = await api.asApp().requestJira(route`/rest/api/2/user`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    });
    const data = await response.json();
    console.log(JSON.stringify(data));  
    return `User data loaded: ${JSON.stringify(data)}`;
  } catch (error) {
    console.error('Error fetching user:', error);
    return 'Error loading user data';
  }
});

resolver.define('storeData', async(req) => {
  try {
    console.log('Request received:', JSON.stringify(req));
    const key = req.key;
    const value = req.value;
    console.log('Storing data:', key, value);
    
    // Store data in memory
    dataStore[key] = value;
    console.log('Current storage:', dataStore);
    
    return `Data stored: ${key} = ${value}`;
  } catch (error) {
    console.error('Error storing data:', error);
    return 'Error storing data';
  }
});

resolver.define('retrieveData', async(req) => {
  try {
    console.log('Request received:', JSON.stringify(req));
    const key = req.key;
    console.log('Retrieving data for key:', key);
    
    // Retrieve data from memory
    const value = dataStore[key];
    const result = value ? `Found: ${value}` : 'Not found';
    console.log('Retrieved:', result);
    
    return result;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return 'Error retrieving data';
  }
});

resolver.define('deleteData', async(req) => {
  try {
    console.log('Request received:', JSON.stringify(req));
    const key = req.key;
    console.log('Deleting data for key:', key);
    
    // Delete data from memory
    delete dataStore[key];
    console.log('Current storage after deletion:', dataStore);
    
    return `Data deleted for key: ${key}`;
  } catch (error) {
    console.error('Error deleting data:', error);
    return 'Error deleting data';
  }
});

export const handler = resolver.getDefinitions();