# Invite Ellie Frontend

The web app for [Invite Ellie](https://inviteellie.ai): the public marketing page at `/`, sign up and sign in, and the signed-in app (dashboard, workspaces, meeting recordings and transcriptions, Ask Ellie, integrations, billing and settings).

Built with React 18, TypeScript, Vite and Tailwind CSS, with React Router for navigation.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:3000. Requests to `/api` are proxied to the backend set in `vite.config.ts`. To use a backend running on your machine, switch the proxy `target` there to `http://localhost:8000`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` / `npm start` | Serve the built `dist/` on port 3000 |

## Environment variables

Set these in a `.env` file at the project root. It is ignored by git.

| Variable | Used for |
| --- | --- |
| `VITE_RECALLAI_BASE_URL` | The recall server (meeting bots, recordings, live notifications). Without it, WebSocket notifications are turned off. |
| `VITE_API_BASE_URL` | Backend URL, used only as a fallback. In the browser the app calls `/api` on its own origin. |
| `VITE_DELETE_ACCOUNT_MODE` | Optional. How account deletion is requested; defaults to `GRACE_PERIOD`. |

In production the app calls `/api` on its own domain, so the host must route `/api` to the backend. `nginx.conf.example` shows one way to do this.

## Project structure

```
src/
  App.tsx          Route table, auth redirects and the global chat widget
  main.tsx         App bootstrap and providers
  components/      One folder per page or feature (dashboard, workspace, login, ...)
    landing/       Marketing page at / and the header shown on auth pages
  context/         Auth, profile and notification state
  services/        API clients (calendar, HubSpot, Notion, Slack, transcriptions, ...)
  utils/           Shared helpers, including API base URL resolution
  styles/          Tailwind entry and global styles
```

Signed-in routes are wrapped in `ProtectedRoute`, which sends signed-out visitors to `/login`. A signed-in visitor who opens `/` is sent to `/dashboard`. Unknown URLs redirect to `/`.

## Marketing page

The page at `/` comes from the standalone Invite Ellie website and lives in `src/components/landing/site/`:

- `site.html`: the page markup
- `site.css`: its styles, injected only while `/` is showing so they never affect the rest of the app
- `siteScript.js`: its animations and interactions, cleaned up when you leave the page

`LandingPage.tsx` renders these and routes links such as `/signup` and `/login` through the app. Edit the page in these files; changes to the standalone website repo do not reach the app.

## Deploying

Production is https://inviteellie.ai, hosted on Railway (project `invite-ellie-frontend`, `production` environment).

Merging to `main` does not deploy on its own. Deploy from an up-to-date `main` with the Railway CLI:

```bash
railway up --ci
```

Railway builds with `npm run build`. If the build fails, the deployment fails and the previous version keeps serving.

GitHub Actions (`.github/workflows/build.yml`) runs the same build on every pull request and every push to `main`, so a broken build shows up on GitHub before you deploy.
