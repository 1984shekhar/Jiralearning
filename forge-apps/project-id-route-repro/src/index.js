import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getAppData', async (req) => {
  return {
    message: 'Project ID route repro app',
    context: req.context || null,
  };
});

export const handler = resolver.getDefinitions();
