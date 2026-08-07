# Filter Non-Rail Emergency Alerts

## Goal

Keep the Mastodon mirror focused on train service by discarding segmentless LTA
emergency messages that identify themselves as bus, road, or traffic notices.

## Context

DataMall uses the Train Service Alerts feed for general emergency notices, most
of which concern buses or roads and have no `AffectedSegments`. Production
history also contains a genuine train update without an affected segment, so
the filter cannot discard every segmentless message. A narrow denylist grounded
in the production history is safer than an invented allowlist of rail wording.
The persisted KV shape and duplicate hash inputs must remain unchanged.

History reviewed:

- `https://mastodon.social/@ltatrainservicealerts.rss`
- irrelevant segmentless notices describe buses, roads/roadworks, or traffic;
- the exceptional segmentless rail notice still identifies itself as a train
  update.

## Steps

- [x] Add a production-history-based classifier with relevant, irrelevant, and
      unknown results.
- [x] Filter irrelevant pairs before posting, comparison, and KV persistence.
- [x] Add tests for segmented, rail-related segmentless, and unrelated messages.
- [x] Give rail evidence precedence over replacement-bus or road wording.
- [x] Normalize legacy KV pairs before removal comparison and still rewrite KV.
- [x] Log raw and discarded alerts for operational diagnosis.
- [x] Document the filtering rule and operational trade-off.

## Validation

- `npm test`
- `npm run check`

## Rollback

Revert the classifier and filtering call. Existing KV data remains compatible;
an irrelevant alert still present upstream could be posted once after rollback.
