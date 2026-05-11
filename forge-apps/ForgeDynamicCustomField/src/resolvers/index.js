import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getDefaultValue', ({ context }) => {
  const issueKey = context?.extension?.issue?.key ?? 'UNKNOWN';
  return `Dynamic value for ${issueKey}`;
});

resolver.define('formatValue', ({ payload, context }) => {
  const value = payload?.value ?? '';
  const issueKey = context?.extension?.issue?.key ?? 'UNKNOWN';
  const today = new Date().toISOString().split('T')[0];

  if (value && value.trim()) {
    return `${value} | issue=${issueKey} | date=${today} | enriched by Forge`;
  }

  return `Generated content | issue=${issueKey} | date=${today} | enriched by Forge`;
});

export const handler = resolver.getDefinitions();
