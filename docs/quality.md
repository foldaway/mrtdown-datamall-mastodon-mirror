# Quality

## Local Gate

Run this before opening a PR or deploying a behavior change:

```sh
npm run check
```

The gate runs:

- `npm run docs:check`
- `npm run typecheck`
- `npm run lint`

## Testing Posture

The repo does not yet have a real test suite. Until it does, treat TypeScript,
Biome, and targeted manual Wrangler runs as the baseline.

Add tests when changing:

- alert pairing or normalization;
- de-duplication hashes;
- KV persistence shape;
- Mastodon post selection;
- resolution post behavior.

## Manual Validation

For Worker flow changes:

1. Start the local Worker with `npm run dev`.
2. Trigger the scheduled handler with `npm run dev:invoke`.
3. Check logs for the normalized DataMall response and Mastodon post responses.
4. Verify KV state when changing persistence behavior.

Use test Mastodon credentials for local validation.
