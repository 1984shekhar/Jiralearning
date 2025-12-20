import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import { Stack, Text, Heading, Spinner } from '@forge/react';

function App() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Invoke useBulkSet automatically when the component mounts.
    useEffect(() => {
        const executeBulkSet = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Invoke the useBulkSet resolver function which will batch set custom entities.
                // This automatically calls generateObjectsToSet() and performs the batch set operation.
                const result = await invoke('useBulkSet', { example: 'my-invoke-variable' });
                setData(result);
            } catch (err) {
                console.error('Error invoking useBulkSet:', err);
                setError(`Error: ${err.message || 'Unknown error occurred'}`);
            } finally {
                setIsLoading(false);
            }
        };

        executeBulkSet();
    }, []);

    return (
        <Stack space="space.200">
            <Heading level="h2">Batch Custom Entity Set Example</Heading>
            {isLoading && (
                <Stack space="space.100">
                    <Spinner />
                    <Text>Executing bulk set operation...</Text>
                </Stack>
            )}
            {data && <Text><strong>Result:</strong> {data}</Text>}
            {error && <Text><strong>Error:</strong> {error}</Text>}
        </Stack>
    );
}

export default App;
