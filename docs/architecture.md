# Architecture

## Runtime

The application is a scheduled Cloudflare Worker. The cron schedule is declared
in `wrangler.jsonc` and currently runs every 2 minutes.

## Flow

1. `src/index.ts` receives a scheduled event.
2. `LtaDataMallClient` calls LTA DataMall's `TrainServiceAlerts` endpoint.
3. Segmentless emergency messages containing the bus/road/traffic terms seen in
   the mirror's production history, and no rail-service terms, are classified as
   irrelevant and discarded after being logged. Alerts with an affected segment
   or rail-service terms are relevant; other segmentless messages are unknown
   and retained.
4. The Worker reads the previous normalized result from Cloudflare KV under
   `previous_run.result` and applies the same filter before removal comparison.
5. New alert message pairs are posted to Mastodon through `MastodonClient`.
6. If the overall status moved from disrupted to normal, removed train alerts
   get a best-effort resolution post and removed emergency alerts get a
   DataMall-removal post.
7. The latest normalized result is written back to KV when it differs from the
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
- Segmentless messages that identify themselves as bus, road, roadworks, or
  traffic notices, without also identifying themselves as rail-related, are not
  mirrored. Rail evidence takes precedence so train disruptions that mention
  replacement buses or roads are retained.
- Unknown segmentless messages are retained. This deliberately favours a
  possible false positive over losing another genuine train update affected by
  missing segment data.
- Relevance classification has three explicit outcomes: `relevant` for alerts
  with affected segments, `irrelevant` for observed non-rail topics, and
  `unknown` for all other segmentless messages. Posting policy drops only
  `irrelevant` alerts.
- Retained segmentless alert messages are prefixed as LTA emergency alerts in
  Mastodon posts so unusual notices remain prominent without looking like
  ordinary MRT/LRT service disruptions.
- Segmentless alert removal posts avoid train-service resolution wording because
  these emergency messages may describe non-train incidents such as road
  closures.
- Mastodon post content should remain close to DataMall's alert text.
- KV writes should happen after posting attempts so failed runs can be retried.
- Legacy KV results are normalized before removal comparison but compared in
  their original form when deciding whether to write, preventing false removal
  posts while ensuring excluded legacy pairs are cleaned up.
- Resolution posting is best effort because DataMall exposes a global status,
  not independent incident lifecycle events.

## External Systems

- LTA DataMall: source of train-service alerts.
- Mastodon: destination account for status posts.
- Cloudflare KV: persistence for the previous normalized DataMall result.
- Cloudflare Workers cron: scheduler and runtime.
