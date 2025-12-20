import Resolver from '@forge/resolver';

const resolver = new Resolver();

// Simple resolver that returns a message
// The remote request (using @forge/bridge) is handled on the frontend
resolver.define('getText', async ({ payload }) => {
  return 'Remote request will be made from frontend using @forge/bridge';
});

export const handler = resolver.getDefinitions();