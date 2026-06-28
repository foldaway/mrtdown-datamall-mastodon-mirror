# Architecture

## Runtime

The application is a scheduled Cloudflare Worker. The cron schedule is declared
in `wrangler.jsonc` and currently runs every 2 minutes.

## Flow

1. `src/index.ts` receives a scheduled event.
2. `LtaDataMallClient` calls LTA DataMall's `TrainServiceAlerts` endpoint.
3. The Worker reads the previous normalized result from Cloudflare KV under
   `previous_run.result`.
4. New alert message pairs are posted to Mastodon through `MastodonClient`.
5. If the overall status moved from disrupted to normal, removed alerts get a
   best-effort resolution post.
6. The latest normalized result is written back to KV when it differs from the
   previous result.

## Data Model

`TrainServiceAlertsResult` is the normalized internal representation:

- `status`: the global train-service status from DataMall.
- `pairs`: ordered `[segment, message]` tuples, where `segment` can be `null`
  because DataMall sometimes omits affected segments.

Duplicate detection uses `hashTrainServicePair`, based on message creation date
and content. This means an edited alert is treated as a new alert.

## Invariants

- Posting must be idempotent across scheduled runs.
- Missing segment data is valid input.
- Mastodon post content should remain close to DataMall's alert text.
- KV writes should happen after posting attempts so failed runs can be retried.
- Resolution posting is best effort because DataMall exposes a global status,
  not independent incident lifecycle events.

## External Systems

- LTA DataMall: source of train-service alerts.
- Mastodon: destination account for status posts.
- Cloudflare KV: persistence for the previous normalized DataMall result.
- Cloudflare Workers cron: scheduler and runtime.
