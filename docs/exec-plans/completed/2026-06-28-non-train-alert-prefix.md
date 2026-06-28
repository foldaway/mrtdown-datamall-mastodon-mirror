# Non-Train Alert Prefix

## Goal

Make segmentless emergency alerts visibly distinct from MRT/LRT service alerts
in Mastodon posts.

## Context

LTA has been sending bus and road incident messages through the Train Service
Alerts API without `AffectedSegments`. The Worker continues to surface those
DataMall messages, but the post prefix now makes clear that they are non-train
emergency alerts so followers do not mistake them for MRT/LRT disruptions.

The KV payload and duplicate hash remain unchanged.

## Steps

- [x] Update the segmentless alert prefix to call out non-train emergency
      alerts.
- [x] Align removed segmentless alert wording with the new prefix.
- [x] Update formatter tests and architecture notes.

## Validation

- `npm test`
- `npm run check`

## Rollback

Revert the formatter copy change and related tests/docs. Since persistence and
hashes are unchanged, rollback does not require a KV migration.
