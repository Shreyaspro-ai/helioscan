# Original source screens

Downloaded from the Google usercontent links provided with the build request.

| File                      | Route in the app | Link |
|---------------------------|------------------|------|
| `01-landing.html`         | `/`              | 5    |
| `02-find-locations.html`  | `/find`          | 2    |
| `03-results.html`         | `/results`       | 3    |
| *(missing)*               | `/report`        | 4 — **HTTP 404, file gone from the host** |
| `05-methodology.html`     | `/methodology`   | 1    |

`convert.cjs` is the HTML-to-JSX converter used for the port; `merged-theme.json`
is the Tailwind theme extracted from the screens' inline config. To re-run:

```bash
npm install node-html-parser
node convert.cjs 01-landing.html ../helioscan/src/pages/Landing.jsx Landing
```

Re-running overwrites hand-made edits in the page files.
