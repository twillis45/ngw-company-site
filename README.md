# ngw-company-site

The public company website for **No Guesswork Systems LLC** —
[noguessworksystems.com](https://noguessworksystems.com).

Next.js static export. Five pages: Home, Solutions, Contact, Privacy Policy,
Terms of Service.

## Running it

**Node ≥ 20.9 is required** and the build fails hard below it.

```bash
nvm use          # reads .nvmrc
npm install
npm run dev
```

## Checks

```bash
npm run verify:all    # builds, then runs every gate
npm run redproof      # reintroduces each fault and asserts its gate goes red
```

`verify:all` asserts its own coverage first — every gate on disk must be
reachable from it, because "does an entry point exist" and "does it run
everything" are different questions.

One gate, `verify:headers`, is **expected to fail** until the security headers
are configured at the edge. It reads the live origin rather than any file here,
and the remediation is in [`docs/SECURITY-HEADERS.md`](docs/SECURITY-HEADERS.md).

## Where things are

| | |
|---|---|
| Company facts used in more than one place | `src/site.ts` |
| Gates | `scripts/gates/` |
| What an operator cannot see | [`docs/ADMIN-CONSOLE.md`](docs/ADMIN-CONSOLE.md) |
| Measured state, traps, open owner items | [`HANDOFF.md`](HANDOFF.md) |

## Deploying

Pushing to `main` deploys. The origin is a Render static site behind Cloudflare;
there is no deploy config in this repo, so the connection lives in the Render
dashboard. Verify against the live origin after pushing, never the dashboard.
