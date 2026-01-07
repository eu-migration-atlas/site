# Atlas AI Assistant

This repository includes a GitHub Pages frontend and a Cloudflare Worker backend for the Atlas AI Assistant. The assistant retrieves answers from Atlas markdown files stored in this repo.

## GitHub Pages setup

1. In GitHub, open **Settings → Pages**.
2. Set **Source** to the `main` branch and the `/site` folder.
3. Save the settings and wait for the Pages URL to appear.
4. Visit `/site/index.html` to use the Atlas AI Assistant UI.

## Cloudflare Worker setup

1. Create a new Worker in Cloudflare.
2. Copy the contents of `backend/worker.js` into the Worker script.
3. Deploy the Worker and note the Worker URL (for example, `https://atlas-assistant.your-domain.workers.dev`).
4. Update the frontend `data-api-url` attribute in `/site/index.html` if you want to point to a non-`/chat` endpoint.

## Environment variables

Set these on the Worker:

- `OPENAI_API_KEY` (required): OpenAI API key used only by the Worker.
- `OPENAI_MODEL` (optional): default `gpt-4.1-mini`.
- `ATLAS_RAW_BASE` (required): base raw GitHub URL, for example `https://raw.githubusercontent.com/<OWNER>/<REPO>/<BRANCH>`.
- `ATLAS_PATHS` (required): newline-separated list of atlas markdown paths, for example:

```
atlas/countries/PL.md
atlas/frameworks/CEAS.md
atlas/themes/integration.md
```

## Local testing (optional)

1. Serve the site locally:

```
python -m http.server 8000 --directory site
```

2. Use a local Worker dev environment or point `data-api-url` to a deployed Worker.

## Atlas content

Atlas markdown files live under:
- `atlas/countries/`
- `atlas/frameworks/`
- `atlas/themes/`
