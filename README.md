# group_user_map

React + Express web app for Chinese province submissions, with GitHub Gist storage and province heatmap rendering.

## Features
- Province-only location input using Chinese province names
- GitHub Gist backend storage for submission data
- China province map with color bands based on submission counts
- "See map" button to view the chart without adding new data
- React frontend with Vite and an Express API server

## Setup
1. Copy `.env.example` to `.env`.
2. Set `GITHUB_TOKEN` and `GIST_ID` in `.env`.
3. Run `npm install`.
4. Use `npm run dev` to start the Vite frontend, and `npm run server` to start the backend.

## Deployment
- Build once with `npm run build`
- Serve the production bundle using `npm start`

## GitHub Pages Deployment
- A GitHub Actions workflow is included at `.github/workflows/deploy.yml`
- On every push to `main`, the site will be built and deployed to the `gh-pages` branch
- The hosted URL will be:
  `https://xrit0515.github.io/group_user_map/`

## Notes
- `GITHUB_TOKEN` must have access to GitHub Gist operations.
- `GIST_ID` should point to a gist used for storing `china-province-submissions.json`.
- GitHub Pages hosts only the static frontend; the backend server is not deployed there.
- To use the full submission flow, run the backend separately with `npm run server`.
