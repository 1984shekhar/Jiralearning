import React, { useEffect, useMemo, useState } from 'react';
import ForgeReconciler, {
  Text,
  Heading,
  Stack,
  SectionMessage,
  Strong,
  Link,
  Code,
  Box,
} from '@forge/react';
import { invoke, view } from '@forge/bridge';

const APP_ID = '3e1a0e51-d3ab-45aa-ac87-defb3eb858ff';

const getEnvironmentIdFromPath = (pathname, appId) => {
  if (!pathname || !appId) {
    return null;
  }

  const marker = `/apps/${appId}/`;
  const index = pathname.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const routeTail = pathname.slice(index + marker.length);
  const [environmentId] = routeTail.split('/');

  return environmentId || null;
};

const buildProjectAppUrl = ({ siteUrl, projectSegment, appId, environmentId }) =>
  `${siteUrl}/jira/software/projects/${projectSegment}/apps/${appId}/${environmentId}`;

const App = () => {
  const [context, setContext] = useState(null);
  const [resolverData, setResolverData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [ctx, data] = await Promise.all([
          view.getContext(),
          invoke('getAppData', {}),
        ]);
        setContext(ctx);
        setResolverData(data);
      } catch (e) {
        setError(String(e));
      }
    };

    load();
  }, []);

  const project = context?.extension?.project || context?.project || {};
  const projectKey = project?.key || 'UNKNOWN_KEY';
  const projectId = project?.id || 'UNKNOWN_ID';
  const siteUrl = context?.siteUrl || window.location.origin;

  const appId = context?.appId || APP_ID;
  const environmentId =
    context?.environmentId ||
    getEnvironmentIdFromPath(
      typeof window !== 'undefined' ? window.location.pathname : '',
      appId,
    ) ||
    'UNKNOWN_ENVIRONMENT_ID';

  const urls = useMemo(() => ({
    keyUrl: buildProjectAppUrl({ siteUrl, projectSegment: projectKey, appId, environmentId }),
    idUrl: buildProjectAppUrl({ siteUrl, projectSegment: projectId, appId, environmentId }),
  }), [siteUrl, projectKey, projectId, appId, environmentId]);

  return (
    <Stack space="space.300">
      <Heading as="h1">Project key vs project ID route repro</Heading>

      <SectionMessage appearance="warning" title="Purpose">
        <Text>
          This app is meant to reproduce Jira routing behavior when a project-scoped app URL
          uses the project <Strong>key</Strong> versus the numeric project <Strong>ID</Strong>.
        </Text>
      </SectionMessage>

      {error && (
        <SectionMessage appearance="error" title="Failed to load context">
          <Text>{error}</Text>
        </SectionMessage>
      )}

      <Box>
        <Text><Strong>Project key:</Strong> {String(projectKey)}</Text>
        <Text><Strong>Project ID:</Strong> {String(projectId)}</Text>
        <Text><Strong>Site URL:</Strong> {siteUrl}</Text>
        <Text><Strong>App ID used in links:</Strong> {appId}</Text>
        <Text><Strong>Environment ID used in links:</Strong> {environmentId}</Text>
        <Text><Strong>Context environment ID:</Strong> {context?.environmentId || 'unavailable'}</Text>
        <Text><Strong>Current page path:</Strong> {typeof window !== 'undefined' ? window.location.pathname : 'unavailable'}</Text>
      </Box>

      <SectionMessage appearance="information" title="How to test">
        <Text>1. Open the key-based URL below. It should load normally.</Text>
        <Text>2. Open the ID-based URL below. Compare redirect behavior, toolbar, and toasts.</Text>
        <Text>3. If the ID URL redirects but shows a broken shell, capture screenshots and console/network logs.</Text>
      </SectionMessage>

      <Box>
        <Text><Strong>Key-based URL</Strong></Text>
        <Code>{urls.keyUrl}</Code>
        <Link href={urls.keyUrl}>Open key-based URL</Link>
      </Box>

      <Box>
        <Text><Strong>ID-based URL</Strong></Text>
        <Code>{urls.idUrl}</Code>
        <Link href={urls.idUrl}>Open ID-based URL</Link>
      </Box>

      <Box>
        <Text><Strong>Resolver message:</Strong> {resolverData?.message || 'Loading...'}</Text>
      </Box>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
