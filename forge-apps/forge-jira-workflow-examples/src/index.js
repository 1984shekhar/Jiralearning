import api, { route } from "@forge/api";

/**
 * This post-function posts a comment on an issue suggesting a cocktail based 
 * on the value of the 'Priority' field. The higher the priority, the stronger
 * the cocktail.
 */
export const postfunction = async ({ issue, transition: { from, to } }) => {
  // For performance reasons, the issue object passed to a post-function only 
  // contains a subset of fields. Here we fetch the full issue object from the 
  // REST API.
  const issueResponse = await api.asApp().requestJira(route`/rest/api/2/issue/${issue.key}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  // Extract the priority field
  const fullIssue = await issueResponse.json();
  const priority = fullIssue.fields.priority.name;

  // Map the priority to the relevant cocktail 
  const cocktails = {
    "Lowest": "Shandy",
    "Low": "Whiteclaw",
    "Medium": "Rum and Coke",
    "High": "Double Rum and Coke",
    "Highest": "Double Rum Neat",
    "This is bad": "Long Island Iced Tea"    
  };
  const cocktail = cocktails[priority];

  // Assemble the comment payload.
  var bodyData = JSON.stringify({
    body: `Nice work! You deserve a ${cocktail}.`
  });

  // Post the comment to the issue. Note we use the V2 REST API here for
  // simplicity, as it accepts plain text comments rather than ADF formatted.
  await api.asApp().requestJira(route`/rest/api/2/issue/${issue.key}/comment`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: bodyData
  });
};

/**
 * This validator implements a Kanban "Work In Progress" limit, by preventing
 * more than 3 issues in the current project from being transitioned into the 
 * target status. When a user attempts to transition an issue through a 
 * transition guarded by this validator, the action will be blocked if there 
 * are already 3 or more issues in the target status.
 */
export const validate = async ({ issue, transition }) => {
  // For performance reasons, the issue object passed to a validator contains
  // a very restricted set of fields. Here we can easily parse the 
  // project key from the issue key, but for some use-cases it will be 
  // necessary to fetch issue fields using REST as in the postFunction example
  // above.
  const projectKey = issue.key.split('-')[0];
  
  // Fetch a list of all issues in the current project in the status that the 
  // user is attempting to transition to.
  const jql = `project = ${projectKey} and status = ${transition.to.id}`;
  console.log('JQL: ',jql);
  const response = await api.asApp().requestJira(route`/rest/api/3/search/jql`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jql: jql
    })
  });
  const data = await response.json();
  console.log('Full response: ', JSON.stringify(data));
  
  // API v3 response contains 'issues' array, not a 'total' field
  const issueCount = data.issues ? data.issues.length : 0;
  console.log('Issue count: ', issueCount);
  
  // Return a `true` result if there are less than the WIP limit of 3 in the 
  // target status, or `false` if we are already at or over the WIP limit. The
  // value of `errorMessage` is ignored for `true` results, so we can safely
  // always pas it here. 
  return {
    result: issueCount < 3,
    errorMessage: '🙅 You have too much Work In Progress.'
  };
}