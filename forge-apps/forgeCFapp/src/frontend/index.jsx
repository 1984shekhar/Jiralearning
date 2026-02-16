import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Text,
} from "@forge/react";
import { view, invoke } from '@forge/bridge';

const View = () => {
  const [fieldValue, setFieldValue] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get custom field context
        const context = await view.getContext();
        setFieldValue(context.extension.fieldValue);
      } catch (error) {
        console.error('Error getting field context:', error);
      }

      try {
        // Call the getText resolver
        const result = await invoke('getText', { example: 'my-invoke-variable' });
        console.log('getText result:', result);
        setData(result);
      } catch (error) {
        console.error('Error invoking getText:', error);
        setData({ error: error.message });
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Text>{`Hello ${fieldValue || 'world'}!`}</Text>
      <Text>Custom Field Value: {fieldValue}</Text>
      <Text>API Response: {data ? JSON.stringify(data) : 'Loading...'}</Text>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <View />
  </React.StrictMode>
);
