import React from 'react';
import ForgeReconciler, { Stack, Text } from '@forge/react';

const App = () => (
  <Stack space="space.100">
    <Text>Dynamic custom field configuration</Text>
    <Text>This is a placeholder for future per-context configuration.</Text>
  </Stack>
);

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
