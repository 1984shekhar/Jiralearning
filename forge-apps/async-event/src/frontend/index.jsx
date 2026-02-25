import React, { useState } from 'react';
import ForgeReconciler, { Button, ButtonGroup, Text } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [stats, setStats] = useState(null);

  const runApp = async () => {
    try {
      await invoke('run-app');
      console.log('App run triggered');
    } catch (error) {
      console.error('Error running app:', error);
    }
  };

  const checkStatus = async () => {
    try {
      const result = await invoke('check-job-status');
      setStats(result);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  return (
    <>
      <ButtonGroup>
        <Button onClick={runApp}>Push Event</Button>
        <Button onClick={checkStatus}>Job Status</Button>
      </ButtonGroup>
      {stats && (
        <Text>
          Job stats: Success: {stats.success}, In Progress: {stats.inProgress}, Failed: {stats.failed}
        </Text>
      )}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
