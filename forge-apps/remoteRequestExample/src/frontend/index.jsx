import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text } from '@forge/react';
import { requestRemote } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make the remote request using requestRemote
        const requestOptions = {
          path: '/todos/1',
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        };
        const response = await requestRemote('my-remote-key', requestOptions);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const todoData = await response.json();
        setData(`Todo title: ${todoData.title}`);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <Text>Hello world!</Text>
      {error && <Text>Error: {error}</Text>}
      {data ? <Text>{data}</Text> : <Text>Loading...</Text>}
    </>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);