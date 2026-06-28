# Emergency Alert Removal Copy

## Goal

Avoid implying that segmentless emergency alerts are train-service disruptions
when they disappear from DataMall.

## Context

Segmentless Train Service Alerts API messages are intentional emergency
communications from LTA and are displayed with an emergency prefix. The previous
resolution post text said the overall train status was now normal for every
removed alert, which was appropriate for train alerts but misleading for
emergency road-closure notices.

The KV payload and duplicate hash remain unchanged.

## Steps

- [x] Add a formatter for removed-alert posts with emergency-specific copy.
- [x] Route resolution posts through the formatter.
- [x] Add focused tests for train-alert and emergency-alert removal wording.
- [x] Document the display behavior in the architecture notes.

## Validation

- `npm test`
- `npm run check`

## Rollback

Revert the formatter and call-site changes. Since persistence and hashes are
unchanged, rollback does not require a KV migration.
