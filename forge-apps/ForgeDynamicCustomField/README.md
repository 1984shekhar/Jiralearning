# Forge dynamic custom field example

This is a separate Forge app that demonstrates a simple Jira dynamic custom field type.

## Files
- `manifest.yml` defines the `jira:customFieldType` module
- `src/resolvers/index.js` contains simple dynamic resolver functions
- `src/frontend/index.jsx` provides the view, edit, and context configuration UI

## Run
1. `npm install`
2. `forge deploy`
3. `forge install`
4. In Jira admin, create a custom field from this Forge app's custom field type
