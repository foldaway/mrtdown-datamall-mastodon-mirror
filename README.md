# MRTDown DataMall Mastodon Mirror

Cloudflare Worker that mirrors Singapore LTA DataMall train service alerts to a
Mastodon account.

The Worker runs on a cron schedule, polls LTA's `TrainServiceAlerts` endpoint,
posts newly seen alert messages to Mastodon, and stores the previous poll result
in Cloudflare KV so duplicate alerts are skipped.

## What it does

- Polls LTA DataMall every 2 minutes.
- Posts new train service alert messages to Mastodon.
- Uses Cloudflare KV to remember the previous DataMall response.
- Posts a best-effort resolution message when the overall train status changes
  from disrupted back to normal.

## Requirements

- Node.js, matching the version in `.nvmrc`
- npm
- A Cloudflare account with Wrangler access
- An LTA DataMall account key
- A Mastodon application access token with permission to create statuses
- A Cloudflare KV namespace bound as `STORE`

## Setup

Install dependencies:

```sh
npm install
```

Create local development secrets in `.dev.vars`:

```sh
LTA_DATAMALL_ACCOUNT_KEY=your-lta-datamall-account-key
MASTODON_HOSTNAME=mastodon.example
MASTODON_ACCESS_TOKEN=your-mastodon-access-token
```

For production, configure the same values as Cloudflare Worker secrets:

```sh
npx wrangler secret put LTA_DATAMALL_ACCOUNT_KEY
npx wrangler secret put MASTODON_HOSTNAME
npx wrangler secret put MASTODON_ACCESS_TOKEN
```

The KV binding is configured in `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "STORE",
    "id": "3fa45f000b694e18969ce49ae48562af"
  }
]
```

If you deploy this under a different Cloudflare account, create your own KV
namespace and replace the `id`.

## Local development

Start Wrangler with scheduled-event support:

```sh
npm run dev
```

Trigger the scheduled handler manually:

```sh
npm run dev:invoke
```

Generate Worker environment types after changing bindings or secrets:

```sh
npm run typegen
```

Run the local validation gate:

```sh
npm run check
```

## Deployment

Deploy with Wrangler:

```sh
npx wrangler deploy
```

The schedule is configured in `wrangler.jsonc`:

```jsonc
"triggers": {
  "crons": ["*/2 * * * *"]
}
```

## Project structure

```text
src/index.ts                         Scheduled Worker entrypoint
src/clients/LtaDataMallClient.ts     LTA DataMall API client and response types
src/clients/MastodonClient.ts        Mastodon status-posting client
src/helpers/hashTrainServicePair.ts  Alert pair hash used for duplicate checks
AGENTS.md                            Agent and contributor guide
docs/                                Architecture, quality, and execution plans
wrangler.jsonc                       Cloudflare Worker configuration
worker-configuration.d.ts            Generated Worker runtime and Env types
```

## Notes

- Resolution posts are best effort. LTA exposes the normal/disrupted status as a
  global flag, so this Worker cannot perfectly distinguish multiple simultaneous
  incidents resolving independently.
- The current implementation compares alert segment/message pairs by hash. If
  LTA changes an existing alert's content, the changed alert is treated as new.
- `npm test` is currently a placeholder and exits with an error.
