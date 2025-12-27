# Forge Jira Workflow Module Examples

Developer Productivity is top of mind for many software teams these days, and Jira’s flexible workflow engine allows teams to streamline workflows to improve the efficiency of their developers. But in the age of Artificial Intelligence, wouldn’t it be great if Jira workflows were a bit… smarter?

Imagine if you could build a Scrum workflow that could validate that a Story is actually a well formatted user story. Or a Kanban board where Work-In-Progress limits are’t just red columns, but actually block transitions if too much work is in progress. Or a DevOps incident workflow that orders a cocktail for the incident manager after a stressful incident is resolved.

Well it turns out, you can! In this repository, you'll find three example implementations of Jira workflow modules built using the Atlassian Forge platform: 

- a custom workflow post-function, which suggests a cocktail based on the severity of an incident;
- a workflow validator, which rejects an issue being transitioned to "In Progress" if your team has already hit the WIP limit;
- a workflow condition, which prevents a story from being added to the backlog if the summary is not a well-formed user story

Forge apps run in the Atlassian Cloud, and are currently free for all users of all editions of our cloud products. Though you need some technical skills to build Forge apps, Forge is a “low code” platform, and the examples in this repository are deisgned to be accessible to any technical team member who has a passing familiarity with JavaScript.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

- Modify your app by editing the `src/index.js` file.

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
