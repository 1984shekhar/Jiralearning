import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Button,
  Heading,
  Inline,
  SectionMessage,
  Strong,
  Text,
  Textfield,
  useProductContext,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const context = useProductContext();
  const extension = context?.extension;
  const [spaceKey, setSpaceKey] = useState('');
  const [appLocalId, setAppLocalId] = useState('');
  const [status, setStatus] = useState('Waiting to create test content.');
  const [result, setResult] = useState(null);

  const moduleKey = context?.moduleKey ?? extension?.moduleKey;
  const isCustomContentView = moduleKey === 'custom-content-anon-repro-content';

  useEffect(() => {
    if (extension?.space?.key) {
      setSpaceKey(extension.space.key);
    }

    if (context?.localId) {
      setAppLocalId(context.localId);
    }
  }, [context, extension]);

  const createContent = async () => {
    setStatus('Creating a custom content item in the selected space...');
    setResult(null);

    try {
      const response = await invoke('createReproContent', {
        spaceKey,
        appLocalId,
      });
      setResult(response);
      setStatus(
        response?.ok
          ? 'Custom content created. Open the URL below in an anonymous browser window to test the issue.'
          : 'Creation failed. Check the detailed diagnostics below.'
      );
    } catch (error) {
      setResult({ ok: false, error: error.message });
      setStatus('Creation failed before the app could return structured diagnostics.');
    }
  };

  if (isCustomContentView) {
    return (
      <>
        <Heading size="medium">Anonymous custom content item</Heading>
        <Text>
          This Forge custom content page rendered successfully. If an authenticated user can see this view
          but an anonymous user gets a not-found page for the same content URL, that helps confirm the
          anonymous access problem under <Strong>supportedSpacePermissions</Strong>.
        </Text>
        <SectionMessage title="View context">
          <Text>{JSON.stringify({ moduleKey: context?.moduleKey, extension: context?.extension })}</Text>
        </SectionMessage>
      </>
    );
  }

  return (
    <>
      <Heading size="medium">Anonymous custom content reproducer</Heading>
      <Text>
        This page creates Confluence custom content with <Strong>supportedSpacePermissions</Strong>
        configured. The issue is reproduced if authenticated users can open the created item but
        anonymous users still cannot, even when the space allows anonymous access.
      </Text>
      <Textfield
        label="Space key"
        value={spaceKey}
        onChange={(event) => setSpaceKey(event.target.value)}
      />
      <Inline>
        <Button appearance="primary" onClick={createContent} isDisabled={!spaceKey}>
          Create repro content
        </Button>
      </Inline>
      <SectionMessage title="Status">
        <Text>{status}</Text>
      </SectionMessage>
      {result ? (
        <SectionMessage title="Result">
          <Text>{JSON.stringify(result)}</Text>
        </SectionMessage>
      ) : null}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
