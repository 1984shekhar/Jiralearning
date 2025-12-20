import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Button, Textfield } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' })
      .then(setData)
      .catch((error) => {
        console.error('Error fetching data:', error);
        setData('Error loading data');
      });
  }, []);

  const handleStoreData = async () => {
    console.log('Key:', key, 'Value:', value);
    if (key && value) {
      try {
        console.log('Invoking storeData with:', { key, value });
        const result = await invoke('storeData', { key, value });
        setMessage(result);
      } catch (error) {
        console.error('Error storing data:', error);
        setMessage('Error storing data');
      }
    } else {
      setMessage('Please provide both key and value');
    }
  };

  const handleRetrieveData = async () => {
    if (key) {
      try {
        const result = await invoke('retrieveData', { key });
        setMessage(result);
      } catch (error) {
        console.error('Error retrieving data:', error);
        setMessage('Error retrieving data');
      }
    } else {
      setMessage('Please provide a key');
    }
  };

  const handleDeleteData = async () => {
    if (key) {
      try {
        const result = await invoke('deleteData', { key });
        setMessage(result);
      } catch (error) {
        console.error('Error deleting data:', error);
        setMessage('Error deleting data');
      }
    } else {
      setMessage('Please provide a key');
    }
  };

  return (
    <>
      <Text>Hello world! This is the first app!</Text>
      <Text>{data ? JSON.stringify(data) : 'Loading...'}</Text>
      <Textfield
        label="Key"
        value={key}
        onChange={(e) => {
          const newVal = typeof e === 'string' ? e : e.target?.value || e;
          console.log('Key changed to:', newVal);
          setKey(newVal);
        }}
        placeholder="Enter key"
      />
      <Textfield
        label="Value"
        value={value}
        onChange={(e) => {
          const newVal = typeof e === 'string' ? e : e.target?.value || e;
          console.log('Value changed to:', newVal);
          setValue(newVal);
        }}
        placeholder="Enter value"
      />
      <Button onClick={handleStoreData}>Store Data</Button>
      <Button onClick={handleRetrieveData}>Retrieve Data</Button>
      <Button onClick={handleDeleteData}>Delete Data</Button>
      <Text>{message}</Text>
    </>
  );
};

ForgeReconciler.render(<App />)
