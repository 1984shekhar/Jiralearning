import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Label, Lozenge, Stack, Text, Textfield } from '@forge/react';
import { invoke, view } from '@forge/bridge';

const App = () => {
  const [moduleKey, setModuleKey] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [previewValue, setPreviewValue] = useState('Loading...');

  useEffect(() => {
    const load = async () => {
      const context = await view.getContext();
      setModuleKey(context?.moduleKey ?? 'unknown');

      if (context?.moduleKey?.includes('view')) {
        const formatted = await invoke('formatValue', {
          value: context?.extension?.fieldValue ?? '',
        });
        setPreviewValue(formatted);
      }

      if (context?.moduleKey?.includes('edit')) {
        const suggested = await invoke('getDefaultValue');
        setFieldValue(context?.extension?.fieldValue ?? suggested);
      }
    };

    load();
  }, []);

  if (moduleKey.includes('edit')) {
    return (
      <Stack space="space.100">
        <Label labelFor="dynamic-field-input">Dynamic custom field</Label>
        <Textfield
          id="dynamic-field-input"
          value={fieldValue}
          onChange={(event) => setFieldValue(event.target.value)}
        />
        <Text>This is a simple editable value for the dynamic custom field.</Text>
      </Stack>
    );
  }

  if (moduleKey.includes('contextConfig')) {
    return (
      <Stack space="space.100">
        <Text>Context configuration placeholder</Text>
        <Text>You can extend this screen later with per-context settings.</Text>
      </Stack>
    );
  }

  return (
    <Stack space="space.100">
      <Text>Dynamic custom field value</Text>
      <Lozenge appearance="inprogress">{previewValue}</Lozenge>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
