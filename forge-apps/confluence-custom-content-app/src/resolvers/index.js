import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();
const customContentModuleKey = 'custom-content-anon-repro-content';

const getCustomContentType = (appLocalId) => {
  if (!appLocalId) {
    throw new Error('The Forge localId was not available in the UI context.');
  }

  const slashAppIdMatch = appLocalId.match(/app\/([^/]+)/);
  const slashEnvironmentIdMatch = appLocalId.match(/environment\/([^/]+)/);

  if (slashAppIdMatch?.[1] && slashEnvironmentIdMatch?.[1]) {
    return `forge:${slashAppIdMatch[1]}:${slashEnvironmentIdMatch[1]}:${customContentModuleKey}`;
  }

  const dashedExtensionMatch = appLocalId.match(
    /^ari-cloud-ecosystem--extension-([0-9a-f-]{36})-([0-9a-f-]{36})-/i
  );

  if (dashedExtensionMatch?.[1] && dashedExtensionMatch?.[2]) {
    const [, appId, environmentId] = dashedExtensionMatch;

    return `forge:${appId}:${environmentId}:${customContentModuleKey}`;
  }

  throw new Error(`Unable to parse appId and environmentId from localId: ${appLocalId}`);
};

const getJson = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { rawText: text, parseError: error.message };
  }
};

const getSpaceId = async (spaceKey) => {
  const response = await api.asUser().requestConfluence(route`/wiki/api/v2/spaces?keys=${spaceKey}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await getJson(response);

  if (!response.ok) {
    throw new Error(`Space lookup failed with ${response.status}: ${JSON.stringify(data)}`);
  }

  const [space] = data?.results ?? [];

  if (!space?.id) {
    throw new Error(`No Confluence space found for key ${spaceKey}.`);
  }

  return space.id;
};

const getCustomContentDetails = async (contentId) => {
  const response = await api.asUser().requestConfluence(route`/wiki/api/v2/custom-content/${contentId}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await getJson(response);

  return {
    ok: response.ok,
    statusCode: response.status,
    data,
  };
};

resolver.define('createReproContent', async (req) => {
  const { spaceKey, appLocalId } = req.payload;

  if (!spaceKey) {
    return {
      ok: false,
      stage: 'validate-input',
      error: 'A Confluence space key is required.',
    };
  }

  let customContentType;

  try {
    customContentType = getCustomContentType(appLocalId);
  } catch (error) {
    return {
      ok: false,
      stage: 'build-content-type',
      error: error.message,
      appLocalId,
    };
  }

  const normalizedSpaceKey = spaceKey.trim();
  const spaceId = await getSpaceId(normalizedSpaceKey);
  const payload = {
    type: customContentType,
    status: 'current',
    title: `Anonymous permission repro ${new Date().toISOString()}`,
    spaceId,
    body: {
      representation: 'storage',
      value: `<p>Anonymous custom content repro created at ${new Date().toISOString()}</p><p>Issue: ECOHELP-129073</p><p>Type: ${customContentType}</p>`,
    },
  };

  const response = await api.asUser().requestConfluence(route`/wiki/api/v2/custom-content`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await getJson(response);

  if (!response.ok) {
    return {
      ok: false,
      stage: 'create-custom-content',
      statusCode: response.status,
      statusText: response.statusText,
      payload,
      response: data,
      appLocalId,
      diagnostics: {
        hint: 'If type looks correct but Confluence returns NOT_FOUND, verify the app was redeployed and upgraded after manifest changes, and confirm the custom content module exists in the same environment as the running page.',
      },
    };
  }

  const contentId = data.id;
  const details = await getCustomContentDetails(contentId);

  return {
    ok: true,
    matchedType: customContentType,
    contentId,
    title: data.title,
    type: data.type,
    status: data.status,
    spaceId,
    guessedUrl: `/wiki/spaces/${normalizedSpaceKey}/custom-content/${contentId}`,
    details,
  };
});

export const handler = resolver.getDefinitions();
