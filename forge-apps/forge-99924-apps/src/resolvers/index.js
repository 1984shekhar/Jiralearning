// import Resolver from '@forge/resolver';

// const resolver = new Resolver();

// resolver.define('getText', (req) => {
//   console.log(req);
//   return 'Hello, world!';
// });

// export const handler = resolver.getDefinitions();
import Resolver from '@forge/resolver';
import { storage } from '@forge/api';
import { v4 as uuidv4 } from 'uuid';

const resolver = new Resolver();

resolver.define('listMySubmissions', async ({ context }) => {
  // Example: fetch all submissions for this user
  const all = await storage.query().where('submitterAccountId', '=', context.accountId).getMany();
  return all.results || [];
});

resolver.define('listApprovalsQueue', async ({ context }) => {
  // Example: fetch all submissions where user is an approver and state is pending
  const all = await storage.query().where('approverIds', 'CONTAINS', context.accountId).getMany();
  return all.results || [];
});

resolver.define('submit', async ({ context, payload }) => {
  const { periodStart, periodEnd, l1ApproverIds = '', l2ApproverIds = '', initialComment = '' } = payload;
  const submission = {
    submissionId: uuidv4(),
    periodStart,
    periodEnd,
    submitterAccountId: context.accountId,
    l1ApproverIds: l1ApproverIds.split(',').map(s => s.trim()),
    l2ApproverIds: l2ApproverIds.split(',').map(s => s.trim()),
    state: 'Submitted',
    initialComment,
    createdAt: new Date().toISOString(),
  };
  await storage.set(submission.submissionId, submission);
  return submission;
});

// Add more actions (approve, clarify, reject, resubmit) as needed

export const handler = resolver.getDefinitions();