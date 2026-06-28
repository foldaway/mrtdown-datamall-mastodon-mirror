# Reliability

## Failure Model

- DataMall fetch failures should cause the scheduled run to fail and retry on
  the next cron tick.
- Mastodon post failures should not be hidden by broad catch blocks.
- KV stores only the previous normalized DataMall result.

## Idempotency

The Worker compares current alert hashes against the previous KV result. Any
change to `hashTrainServicePair` changes posting behavior and should be covered
by an execution plan and tests.

## Observability

Worker logs are enabled in `wrangler.jsonc`. Logs should help diagnose which
messages were seen and posted without exposing secrets.
