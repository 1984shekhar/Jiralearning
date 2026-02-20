import Resolver from '@forge/resolver';

const resolver = new Resolver();

// No resolvers needed for now - custom field value handling is done in frontend
// using CustomFieldEdit component which manages submission directly

export const handler = resolver.getDefinitions();
