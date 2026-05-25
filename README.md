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
- Build once with `npm run build`
- Preview locally with `npm run preview`
- GitHub Pages will host the static frontend at `https://xrit0515.github.io/group_user_map/`

## GitHub Pages Deployment
- A GitHub Actions workflow is included at `.github/workflows/deploy.yml`
- On every push to `main`, the site will be built and deployed to the `gh-pages` branch
- The hosted URL will be:
  `https://xrit0515.github.io/group_user_map/`

## Notes
- `VITE_GIST_ID` should point to a gist used for storing `usermap.json`.
- Data is read/written directly from the browser using GitHub's Gist API.
- To submit data, enter a GitHub token directly in the page or provide it via URL query parameter `?token=YOUR_TOKEN`.
- Read-only viewing works without a token.
