# group_user_map

React web app for Chinese province submissions, with direct GitHub Gist storage and province heatmap rendering.

## Features
- Province-only location input using Chinese province names
- Direct GitHub Gist read/write from the frontend
- China province map with color bands based on submission counts
- "See map" button to view the chart without adding new data
- React frontend with Vite

## Setup
1. Copy `.env.example` to `.env`.
2. Set `VITE_GIST_ID` in `.env`.
3. Run `npm install`.
4. Use `npm run dev` to start the frontend.

## Runtime Token and URL Support
- You can pass a GitHub token in the URL using `?token=YOUR_TOKEN`.
- You can also override the Gist ID via `?gist_id=YOUR_GIST_ID`.
- If the token is provided through the URL, the app will verify it automatically.

## Deployment
- Build once with `npm run build` (outputs to `docs/`)
- Preview locally with `npm run preview`
- The site will be published at `https://<your-username>.github.io/group_user_map/` once deployed

## GitHub Pages Deployment
- This repo builds to `docs/` so you can serve the site directly from the `main` branch (`main` -> `/docs`) via GitHub Pages, or use the included GitHub Actions workflow to publish `docs/` to the `gh-pages` branch automatically.
- To use the Actions workflow (already present at `.github/workflows/deploy.yml`): the workflow runs on push to `main`, builds the site, and publishes the `docs/` output.

Quick deploy steps (option A - Pages from `main`/`docs`):
1. Push the repo to GitHub.
2. In your repository Settings → Pages, choose `Branch: main` and `Folder: /docs` then save.

Option B (Actions publishing to `gh-pages`):
1. Push the repo to GitHub.
2. The workflow will run on push to `main` and publish the `docs/` output to the `gh-pages` branch. Enable GitHub Pages to serve from the `gh-pages` branch if needed.

Commands to build locally:
```bash
npm install
npm run build
npm run preview
```

## Notes
- `VITE_GIST_ID` should point to a gist used for storing `usermap.json`.
- Data is read/written directly from the browser using GitHub's Gist API.
- To submit data, enter a GitHub token directly in the page or provide it via URL query parameter `?token=YOUR_TOKEN`.
- Read-only viewing works without a token.
