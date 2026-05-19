import React, { useState } from 'react';
import ForgeReconciler, { Button, Code, Stack, Text } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onInspect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await invoke('inspectLicense');
      setResult(response);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack space="space.200">
      <Text>Inspect the raw Forge Invocation Token license payload returned by the remote backend.</Text>
      <Button appearance="primary" onClick={onInspect} isDisabled={loading}>
        {loading ? 'Inspecting…' : 'Inspect license payload'}
      </Button>
      {error && <Text>Error: {error}</Text>}
      {result && <Code language="json">{JSON.stringify(result, null, 2)}</Code>}
    </Stack>
  );
};

ForgeReconciler.render(<App />);
