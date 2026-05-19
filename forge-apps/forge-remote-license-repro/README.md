# Forge Remote License Repro

This app is a small Forge + remote backend repro used to inspect license information passed through Forge resolver context and the Forge Invocation Token (FIT) sent to a remote backend.

## What this app does

- Renders a Jira global page named **Forge Remote License Repro**.
- Calls a Forge resolver from the UI.
- The resolver invokes a remote backend at `/inspect-license`.
- The remote backend decodes the FIT without verification and returns the raw `app.license` payload.
- The response also includes `context.license` forwarded from the Forge resolver as `localLicense`.

## Project structure

- `manifest.yml` - Forge app configuration
- `src/index.js` - Forge resolver that calls the remote
- `src/frontend/index.jsx` - Forge UI that displays the JSON response
- `remote/server.js` - Express remote backend

## Prerequisites

- Node.js installed
- Forge CLI installed and authenticated
- Access to a Jira site where you can install Forge apps
- A public HTTPS URL for the remote backend

## Install dependencies

Install dependencies for the Forge app:

```bash
npm install
```

Install dependencies for the remote backend:

```bash
cd remote
npm install
cd ..
```

## Run the remote backend locally

Start the remote backend:

```bash
cd remote
npm start
```

By default it listens on:

```text
http://localhost:4310
```

Health check:

```bash
curl http://localhost:4310/
```

Expected response:

```json
{"ok":true,"message":"Forge Remote License Repro remote is running."}
```

## Expose the remote backend with a public URL

Forge remotes must use a public HTTPS URL. If you are testing locally, expose the remote server using Cloudflare Tunnel.

Start the remote server first:

```bash
cd remote
npm start
```

Then, in a separate terminal, run:

```bash
cloudflared tunnel --url http://localhost:4310
```

This command will print a public HTTPS URL similar to:

```text
https://your-remote-subdomain.trycloudflare.com
```

Copy that URL and use it as the remote `baseUrl` in `manifest.yml`.

## Update the remote URL in the manifest

Open `manifest.yml` and update:

```yml
remotes:
  - key: license-inspector
    baseUrl: https://your-remote-subdomain.trycloudflare.com
```

After changing `manifest.yml`, redeploy the app.

## Deploy and install the app

Run these commands from the app root:

```bash
forge deploy -e development
forge install -e development
```

If the app is already installed:

```bash
forge install -e development --upgrade
```

## License simulation testing in development

If `app.licensing.enabled` is set to `true` in `manifest.yml`, use the development environment to simulate license behavior.

Example commands:

```bash
forge deploy -e development
forge install -e development --license active
```

or:

```bash
forge deploy -e development
forge install -e development --license trial
```

Upgrade examples:

```bash
forge install -e development --license active --upgrade
forge install -e development --license trial --upgrade
```

## Production-style install testing

If `app.licensing.enabled` is set to `false`, install the app in production as a normal unlicensed app.

Example commands:

```bash
forge deploy -e production
forge install -e production
```

If already installed:

```bash
forge install -e production --upgrade
```

## Important note about production licensing

License simulation flags are not supported in the production environment.

These commands will fail:

```bash
forge install -e production --license active
forge install -e production --license trial
```

Use development for license simulation testing.

## How to test the app

1. Install the app on your Jira site.
2. Open the **Forge Remote License Repro** global page.
3. Click **Inspect license payload**.
4. Review the returned JSON.

Useful fields in the response:

- `localRequestBody.localLicense` - license data from Forge resolver context
- `remoteFitPayload.app.license` - license data decoded from the FIT in the remote
- `remoteLicense` - extracted remote license payload
- `licenseFieldTypes` - type summary for the remote license fields

## Notes

- This app is intended for testing and repro purposes.
- The remote backend decodes the FIT without verification for inspection only.
- A temporary tunnel URL is usually fine for testing, but not for stable production usage.
