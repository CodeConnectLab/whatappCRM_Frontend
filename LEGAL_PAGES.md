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

3. **Configure SPA fallback on the web server.** This is the one thing that
   fails Meta review silently. A hard load of
   `https://wtsp.codeconnect.in/privacy` must return HTTP 200 with the app
   shell — not 404, and not a redirect to `/`.

   nginx:

   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

   Netlify — `public/_redirects`: `/*  /index.html  200`
   Vercel — `vercel.json` rewrite of `/(.*)` to `/index.html`
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
