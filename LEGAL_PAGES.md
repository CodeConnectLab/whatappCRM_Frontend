# Public legal pages

Three routes are public and must stay that way:

| Route            | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `/privacy`       | Privacy Policy — submitted to Meta for app review          |
| `/terms`         | Terms of Service                                           |
| `/data-deletion` | Data Deletion Instructions — required by Meta app review   |

They render outside `RequireAuth` (see `src/App.tsx`). Content lives in
`src/pages/legal/`, and every operator-supplied value is in
`src/pages/legal/legalConfig.ts`.

## Before submitting to Meta

1. Fill in every remaining placeholder:

   ```
   grep -rn "FILL:" src/pages/legal
   ```

   Unfilled values render as a yellow `[FILL: ...]` badge on the live page.

2. Bump `EFFECTIVE_DATE` and `LAST_UPDATED` in `legalConfig.ts`.

3. **SPA fallback must be configured on the host.** This is the one thing that
   fails Meta review silently, and it is what produced a Vercel 404 on
   `/privacy` the first time these pages went out.

   This project deploys to **Vercel**, which does not add an SPA fallback for
   Vite projects on its own: a request for `/privacy` finds no file at that
   path and Vercel serves its own 404 before the app ever loads. `vercel.json`
   in the repo root fixes it:

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

   Vercel checks the filesystem before applying rewrites, so `/robots.txt`,
   `/sitemap.xml` and hashed assets are still served as real files. Do not
   replace this with a `redirects` entry — a 301/302 to `/` also fails review.

   Other hosts, for reference:

   ```nginx
   # nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

   Netlify — `public/_redirects`: `/*  /index.html  200`
   Apache — `FallbackResource /index.html`

4. Verify all three, unauthenticated, from outside your network:

   ```
   for p in privacy terms data-deletion; do
     curl -s -o /dev/null -w "$p %{http_code}\n" https://wtsp.codeconnect.in/$p
   done
   ```

   All three must print `200`. Also confirm `/robots.txt` allows them — it does
   by default (`public/robots.txt`), so do not add `Disallow` or a `noindex`
   tag.
