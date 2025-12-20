import api, { fetch } from '@forge/api';
import Resolver from '@forge/resolver';

const resolver = new Resolver();

// Simple resolver that uses the basic fetch client
resolver.define('getData', async (req) => {
  // External API example:
  const response = await fetch('https://jsonplaceholder.typicode.com/posts/1/comments');

  const status = response.status;
  const text = await response.text(); // Could also use response.json() if JSON
  console.info(`print Response: ${text}`);
  // Return something simple to your UI
  return {
    status,
    length: text.length,
    snippet: text.slice(0, 200),
  };
});

export const handler = resolver.getDefinitions();
