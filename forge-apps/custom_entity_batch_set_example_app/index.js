import Resolver from '@forge/resolver';
import { api as kvs } from '@forge/kvs';

const resolver = new Resolver();

const generateObjectsToSet = () => {
    const entityName = 'tsp_dc_cloud_migration_log';
    const objects = [];
    
    // Partition keys: migrationId, transferId
    // Range key: level
    const migrationId = 'dd38d622-8318-45cf-8a93-aee70a8900a4';
    const transferId = '694ca0f7-4f65-5eaa-8119-946992bae2ea';
    const baseTimestamp = new Date().getTime();

    for (let i = 0; i < 10; i++) {
        // The key format for custom entities with partition and range keys is:
        // {partition-key-1}#{partition-key-2}#{range-key}
        // 
        // Since each log entry needs a unique key and our range key is 'level',
        // we encode the sequence number into the level to make each key unique.
        // Alternatively, you could use different level values (INFO, WARNING, ERROR, etc.)
        const timestamp = baseTimestamp + i;
        const levelWithSequence = `INFO_${i}`;  // Make each level unique
        const key = `${migrationId}#${transferId}#${levelWithSequence}`;
        
        const object = {
            key,
            entityName,
            value: {
                migrationId,
                transferId,
                message: `Downloading data for project=10806 [${i}]`,
                level: levelWithSequence,  // Store the full level with sequence in the entity
                timestamp,
            }
        };
        objects.push(object);
    }

    return objects;
};

const useBulkSet = async () => {
    const objectsToSet = generateObjectsToSet();

    try {
        console.log('2: Trying to batch set save import logs partition: ', JSON.stringify(objectsToSet));
        await kvs.batchSet(objectsToSet);
    } catch (e) {
        console.error(`3: Could not batch set save import logs partition=${JSON.stringify(objectsToSet)} due to error: `, e);
    }
};

resolver.define('useBulkSet', async (req) => {
    console.log('1: ',req);

    await useBulkSet();

    return 'Hello, world!';
});

export const handler = resolver.getDefinitions();
