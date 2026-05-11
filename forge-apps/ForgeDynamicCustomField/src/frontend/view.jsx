import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Lozenge, Stack, Text } from '@forge/react';
import { invoke, view } from '@forge/bridge';

const App = () => {
  const [rawValue, setRawValue] = useState('');
  const [decoratedValue, setDecoratedValue] = useState('Loading...');
  const [moduleKey, setModuleKey] = useState('unknown');

  useEffect(() => {
    const load = async () => {
      const context = await view.getContext();
      const currentValue = context?.extension?.fieldValue ?? '';

      setModuleKey(context?.moduleKey ?? 'unknown');
      setRawValue(currentValue);

      const formatted = await invoke('formatValue', {
        value: currentValue,
      });
      setDecoratedValue(formatted);
    };

    load();
  }, []);

  return (
    <Stack space="space.100">
      <Text>Dynamic custom field view</Text>
      <Text>Module key: {moduleKey}</Text>
      <Text>Raw value: {rawValue || '(empty)'}</Text>
      <Lozenge appearance="inprogress">{decoratedValue}</Lozenge>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
