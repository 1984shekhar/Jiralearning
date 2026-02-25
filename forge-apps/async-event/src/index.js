import { Queue, InvocationError } from '@forge/events';
import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();
const queue = new Queue({ key: 'my-app-queue'} );
const jobStorageKey = 'job-storage-key';

/*
The resolver follows the same base logic from the previous exercise,
except that now we included logic to forcefully throw an exception to mimic a scenario
where the resolver has failed to execute.
*/
resolver.define("event-listener", async ({ payload, context }) => {
  console.log(`Received new job event with ID ${context.jobId}`);

  await new Promise((resolve) => setTimeout(resolve, 5000));

   let result = payload < 0.5 ? true : false;

  if(result) {
    console.log(`Payload is ${payload}, job will succeed`);
    return
  } else {
    console.log(`Payload is ${payload}, job will be canceled`);
    return new InvocationError();
  }
})

const saveInStorage = async (key, data) => {
  try {
    await storage.set(key, data)
    return true
  }
  catch(e) {
    console.log(e);
    return false;
  }
}

const getFromStorage = async (key) => {
  const data = await storage.get(key);
  return data;
}

/*
Queues a new job in the Async Events API
*/
const queueJob = async (payload, delay) => {
  let jobId = await queue.push(payload, { delayInSeconds: delay } );
  return jobId;
}

/*
This method is responsible for breaking down the response of `getStats()` of a job,
which will contain data regarding whether the job succeeded, failed or is in progress.
*/
const checkJobStatus = async () => {
  //Get the Job ID from storage and then gets the Job by ID
  let jobId = await getFromStorage(jobStorageKey);
  if (!jobId) {
      return { success: 0, inProgress: 0, failed: 0 };
  }
  const job = queue.getJob(jobId);

  //Get stats of a particular job
  const response  = await job.getStats();
  const { success, inProgress, failed } = await response.json();

  console.log(`Job stats:\nSuccess: ${success}\nIn Progress: ${inProgress}\nFailed: ${failed}`);
  return { success, inProgress, failed };
}

resolver.define("run-app", async () => {
  const payload = Math.random();
  const delay = 0;
  let jobId = await queueJob(payload, delay);

  await saveInStorage(jobStorageKey, jobId);
})

resolver.define("check-job-status", async () => {
    return await checkJobStatus();
})

export const handler = resolver.getDefinitions();
