const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch (error) {
    return {
      decodeError: error.message
    };
  }
};

const buildSummary = (source, payload) => ({
  source,
  moduleKey: payload?.context?.moduleKey || null,
  cloudId: payload?.context?.cloudId || null,
  extensionType: payload?.contextTokenClaims?.extensionType || null,
  extensionId: payload?.contextTokenClaims?.extensionId || null,
  contextIds: payload?.contextTokenClaims?.contextIds || null,
  resourceType: payload?.context?.resourceType || payload?.contextTokenClaims?.context?.resourceType || null,
  url: payload?.context?.url || payload?.contextTokenClaims?.context?.url || null,
  spaceKey: payload?.context?.spaceKey || payload?.contextTokenClaims?.context?.spaceKey || null,
  spaceId: payload?.context?.spaceId || payload?.contextTokenClaims?.context?.spaceId || null,
  contentId: payload?.context?.contentId || payload?.contextTokenClaims?.context?.contentId || null,
  hasContextToken: Boolean(payload?.contextToken)
});

export const resolver = async (req) => {
  const contextTokenClaims = decodeJwtPayload(req?.contextToken);
  const resolverPayload = {
    ...req,
    contextTokenClaims
  };

  console.log('=== PAGE RESOLVER CONTEXT START ===');
  console.log(JSON.stringify(resolverPayload, null, 2));
  console.log('=== PAGE RESOLVER CONTEXT END ===');
  console.log('=== PAGE RESOLVER SUMMARY START ===');
  console.log(JSON.stringify(buildSummary('page-resolver', resolverPayload), null, 2));
  console.log('=== PAGE RESOLVER SUMMARY END ===');

  return {
    pageTitle: 'Rovo Context Reproducer',
    instructions: [
      'Open the Rovo agent from this page.',
      'Ask it to "Inspect context".',
      'Compare the page resolver summary and action summary in Forge logs.',
      'Repeat from the global page and the space page.'
    ]
  };
};

export const inspectContext = async (payload) => {
  const contextTokenClaims = decodeJwtPayload(payload?.contextToken);
  const actionPayload = {
    ...payload,
    contextTokenClaims
  };

  console.log('=== ROVO ACTION PAYLOAD START ===');
  console.log(JSON.stringify(actionPayload, null, 2));
  console.log('=== ROVO ACTION PAYLOAD END ===');
  console.log('=== ROVO ACTION SUMMARY START ===');
  console.log(JSON.stringify(buildSummary('rovo-action', actionPayload), null, 2));
  console.log('=== ROVO ACTION SUMMARY END ===');

  return {
    status: 'logged',
    message: 'Resolver context and Rovo action payload logged for comparison.',
    observedContext: payload?.context || null,
    decodedContextTokenClaims: contextTokenClaims,
    note: payload?.note || null
  };
};
