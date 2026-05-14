# Multiple Apps Conflict Reproducer

This Forge app is a minimal Jira UI Modifications reproducer for `MULTIPLE_APPS_CONFLICT`.

## Goal

Install two separately deployed copies of this app on the same Jira site, both targeting the same Create Issue context. Each copy writes a different value to the same field (`summary`) and registers an `onError` handler for conflict detection.

## How to use

1. Duplicate this directory into two separate local app folders, for example `multiple-apps-conflict-reproducer-a` and `multiple-apps-conflict-reproducer-b`.
2. In each copy, change `APP_INSTANCE_LABEL` in `static/hello-world/src/index.js` to a unique value such as `APP_A` and `APP_B`. In this prepared copy, the label is already set to `APP_A`.
3. In each copy, run `forge register` so each folder gets its own `app.id` in `manifest.yml`.
4. In each copy, build the static app:
   - `cd static/hello-world`
   - `npm install`
   - `npm run build`
5. In each copy, install root dependencies and deploy:
   - `npm install`
   - `forge deploy`
   - `forge install`
6. Install both apps onto the same Jira site.
7. Open Jira Create Issue in a project/issue type context where both apps registered.
8. Check the visible summary value and browser console logs for both app labels.

## Expected repro signal

- Both app copies log `onInit`.
- Both attempt `summary.setValue(...)`.
- The final visible value comes from only one app.
- If the bug exists, `onError` may not report `MULTIPLE_APPS_CONFLICT`.

## Notes

- This app intentionally does **not** modify or delete any existing UI modifications created by other apps.
- It currently targets the `GIC` (global issue create) view and the `summary` field for the simplest possible repro.
