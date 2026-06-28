# Emergency Alert Prefix

## Goal

Make DataMall emergency messages that arrive through the Train Service Alerts API
stand out in mirrored Mastodon posts.

## Context

LTA advised that emergency road-closure messages can intentionally arrive on the
Train Service Alerts API without the usual `AffectedSegments` data. The Worker
already tolerates missing segments and stores them as `null`, but mirrored posts
previously used the raw message text without a prominent label.

The KV payload and duplicate hash must remain based on the original DataMall
message so idempotency is unchanged.

## Steps

- [x] Add a post formatter that prefixes segmentless alerts.
- [x] Route new alert and resolution posts through the formatter.
- [x] Add focused unit coverage for prefixed and unprefixed alert posts.
- [x] Document the display behavior in the architecture notes.

## Validation

- `npm test`
- `npm run check`

## Rollback

Revert the formatter helper and call sites. Since the persisted KV shape and hash
inputs are unchanged, rollback does not require a data migration.
