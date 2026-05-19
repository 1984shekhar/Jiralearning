import Resolver from '@forge/resolver';
import { invokeRemote } from '@forge/api';

const resolver = new Resolver();

resolver.define('inspectLicense', async ({ context }) => {
  const response = await invokeRemote('license-inspector', {
    method: 'POST',
    path: '/inspect-license',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      moduleKey: context?.moduleKey ?? null,
      cloudId: context?.cloudId ?? null,
      localLicense: context?.license ?? null,
    }),
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      parseError: error.message,
      raw: text,
    };
  }
});

export const handler = resolver.getDefinitions();
