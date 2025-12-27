# What is this?

Here is a rough suggested script if you'd like to "demo" the creation of this app as part of a presentation or for a live audience.

# Pre-requisites

You will need:

- to have [set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for your local environment.
- created a set of simple workflows in a Jira site that you are an administrator of to install the workflow modules into

# Script

## Part One - your first post function

1. `forge create` > Jira > Post-function module
1. Update post-function definition in `manifest.yml` to indicate it will suggest a suitable cocktail based on the severity of the incident.
1. Upgrade to the new runtime in `manifest.yml`:
```
app:
    runtime:
        name: nodejs18.x
```
1. `forge deploy`
1. `forge install` > Jira > your site
1. Navigate to the **Add Post Function to Transition** screen in your workflow config (note: you will need to use the "old" workflow editor to do so), and add your "Suggest a cocktail" module.
1. Publish the workflow draft.
1. Transition an issue so that your validator is triggered.
1. Browse to the developer console and observe the log being triggered (don't forget to set the environment to `Development`!)
1. Navigate to the 'Add Comment' REST docs for Jira v2 API (v2 uses plain text instead of ADF, so is more approachable for novice audiences). Recommended path: https://developer.atassian.com > Check out the APIs > Jira Cloud Platform (REST APIs) > Rest API v2 > Issue Comments > POST Add Comment. (suggested talking point — there are a lot of powerful APIs available)
1. Add the appropriate scope (`write:jira-work`) to `manifest.yml`
1. Copy the import into your index.js file.
1. `npm install @forge/api`
1. Copy the Forge example into index.js.
1. Clean-up indentation etc.
1. Make the post-function async.
1. Delete the `visibility` section of the `bodyData` (we don't want to restrict comment visibility, WATCH YOUR COMMAS!).
1. Replace the lorem ipsum with a message (e.g. "Nice work! You deserve a ${cocktail}." -- if you use this, don't forget to declare cocktail).
1. Replace the `{issueIdOrKey}` in the URL with `${issue.key}`.
1. Replace `.asApp()` with `.asUser()`.
1. Run `forge deploy`.
1. Run `forge install --upgrade` to update the scopes.
1. Re-test the app, and observe the comment.
1. Run `forge tunnel`.
1. Fetch the full issue field set using GET /rest/api/2/issue/{issueIdOrKey} (suggest copying from the docs again)
1. Add a mapping of issue priority to suggested cocktail — const cocktails = {"Lowest": "Shandy", ... }
1. Test & demo.
1. Kill the tunnel and `forge deploy`

## Part Two - your first validator

1. Navigate to Validator docs. Suggested path: https://developer.atlassian.com > Build a Forge app > Refernce > Modules > Jira Modules > Workflow validator > Validating with Lambda functions.
1. Copy the `jira:workflowValidator` "function"-based moduel definition example into the `manifest.yml`
1. Add a new `validate` function to `index.js` (make it async)
1. Stub out the response to always block with something humorous e.g. `return { result: false, errorMessage: '🙅 No transitioning issues after drinking cocktails.' }`
1. `forge deploy` & `forge tunnel`.
1. Add the validator module to the IN PROGRESS transition in your workflow (!! don't forget to publish the workflow !!)
1. Test it!
1. Log the `transition` argument
1. Add a call to GET /rest/api/2/search (recommend grabbing it from the documentation tab that you hopefully still have open)
1. Craft the JQL in the issue navigator e.g. `project = "MOB" and status = 10201`
1. Add the JQL to the code.
1. Don't forget to change the request to `.asApp()` rather than `.asUser()`
1. Log the response.json()
1. Test and compare the issues to the board.
1. Update the function response to something like: `return { result: issue.total < 3, errorMessage: '🙅 Too much Work In Progress!' }`
1. Demo.
1. Kill the tunnel and `forge deploy`

## Part Three - your first condition

1. Browse to the Forge Jira workflow condition documentation.
1. Add a `jira:workflowCondition:` to your manifest.yml
1. Update the condition to be something like:
```
  jira:workflowCondition:
    - key: summary-is-story
      name: Summary is a Story
      description: Test if the summary is a well-formed user story.
      expression: issue.summary.match('As a .*, I want to .*, so that .*') != null
```
1. Add the condition module to the SELECT FOR DEVELOPMENT transition in your workflow (DON'T FORGET TO PUBLISH IT!)
1. Observe that you can no longer transition the issue into SELECT FOR DEVELOPMENT
1. Update the issue summary so that it conforms to the story pattern.
1. Observe that you can now transition the issue!

# Feedback

- should have @forge/api imported by default in templates.
- post-function function should be async
- better error in runtime when using asUser() and user hasn't authenticated.
- should use JSON.stringify() in examples to avoid encoding pain.
- scope linting not working for add comment?
- https://developer.atlassian.com/platform/forge/manifest-reference/modules/ (beta?! there should be no Forge betas) 
- bit weird that we refer to functions as 'lambda functions' in the workflow docs
- need more consistency in function signatures in docs
- issue object passed to validator function is inconsistent and anaemic compared to post-function
- can't seem to use .asUser() in workflow modules? Would've thought this is less of a problem with EUC gone.
- 403 & "OAuth 2.0 is not enabled for method: POST /rest/api/2/issue/MOB-20/properties/summaryIsStory" is annoying for wrong method type (should have been PUT)
- so lame that the entity properties API is being deprecated
- Response object for `fetch` Forge methods is not documented, and it mentions a "partial polyfill" .. not great.
- Need more code examples and cross-referencing in reference docs. Have to do so much clicking at the moment.
