import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const result = await invoke('getData', {});
      console.log("result : ${result}");
      setData(result);
    }

    load();
  }, []);

  if (!data) {
    return <div>Loading…</div>;
  }

  return (
    <div>
      <h3>Basic Fetch Demo</h3>
      <p>Status: {data.status}</p>
      <p>Response length: {data.length}</p>
      <pre>{data.snippet}</pre>
    </div>
  );
}

export default App;