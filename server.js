import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_ID = process.env.GIST_ID;
const GIST_FILE_NAME = process.env.GIST_FILE_NAME || 'china-province-submissions.json';
const GITHUB_API_BASE = 'https://api.github.com/gists';

app.use(express.json());

function gistHeaders() {
  return {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'group_user_map-app',
  };
}

async function fetchGist() {
  const response = await fetch(`${GITHUB_API_BASE}/${GIST_ID}`, {
    headers: gistHeaders(),
  });
  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

async function loadSubmissions() {
  const gist = await fetchGist();
  const file = gist.files?.[GIST_FILE_NAME];
  if (!file || !file.content) {
    return [];
  }
  try {
    const parsed = JSON.parse(file.content);
    return Array.isArray(parsed.submissions) ? parsed.submissions : [];
  } catch (error) {
    return [];
  }
}

async function saveSubmissions(submissions) {
  const content = JSON.stringify({ submissions }, null, 2);
  const response = await fetch(`${GITHUB_API_BASE}/${GIST_ID}`, {
    method: 'PATCH',
    headers: gistHeaders(),
    body: JSON.stringify({ files: { [GIST_FILE_NAME]: { content } } }),
  });
  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

app.get('/api/data', async (req, res) => {
  if (!GITHUB_TOKEN || !GIST_ID) {
    return res.status(500).json({ error: 'Missing GITHUB_TOKEN or GIST_ID environment variables.' });
  }

  try {
    const submissions = await loadSubmissions();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/submit', async (req, res) => {
  if (!GITHUB_TOKEN || !GIST_ID) {
    return res.status(500).json({ error: 'Missing GITHUB_TOKEN or GIST_ID environment variables.' });
  }

  const { province, name, email } = req.body;
  if (!province) {
    return res.status(400).json({ error: 'Province is required.' });
  }

  try {
    const submissions = await loadSubmissions();
    const newEntry = {
      id: `${Date.now()}`,
      province,
      name: name || '',
      email: email || '',
      createdAt: new Date().toISOString(),
    };
    submissions.push(newEntry);
    await saveSubmissions(submissions);
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
