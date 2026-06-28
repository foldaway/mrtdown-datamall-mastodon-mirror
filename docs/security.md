# Security

## Secrets

Required secrets:

- `LTA_DATAMALL_ACCOUNT_KEY`
- `MASTODON_HOSTNAME`
- `MASTODON_ACCESS_TOKEN`

Use `.dev.vars` for local development and Wrangler secrets for production.
Never commit real credentials, local KV dumps, or Mastodon access tokens.

## External Calls

The Worker sends authenticated requests to LTA DataMall and Mastodon. Keep
request construction explicit and avoid logging secrets or full authorization
headers.

## Operational Risk

This service can publish public Mastodon posts. Prefer fail-closed behavior for
ambiguous data, and validate de-duplication changes with test credentials before
production deployment.
