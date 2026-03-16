import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello, world!';
});

export const handler = resolver.getDefinitions();

export const versionCreated = async (event) => {
  console.log('--- Version Created Trigger ---');
  console.log('Event structure:', JSON.stringify(event, null, 2));
};
