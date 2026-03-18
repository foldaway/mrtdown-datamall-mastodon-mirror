import { deepStrictEqual } from 'node:assert';
import {
  LtaDataMallClient,
  TrainServiceStatus,
  type TrainServiceAlertsResult,
  type TrainServiceSegmentMessagePair,
} from './clients/LtaDataMallClient';
import { MastodonClient } from './clients/MastodonClient';
import { hashTrainServicePair } from './helpers/hashTrainServicePair';

const STORE_KEY_PREVIOUS_RUN_RESULT = 'previous_run.result';

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    const datamallClient = new LtaDataMallClient(env.LTA_DATAMALL_ACCOUNT_KEY);
    const trainServiceAlerts = await datamallClient.trainServiceAlerts();
    console.log({ trainServiceAlerts });

    const previousRunResult = await env.STORE.get<TrainServiceAlertsResult>(
      STORE_KEY_PREVIOUS_RUN_RESULT,
      'json',
    );
    let previousRunHashes = new Set<string>();
    if (previousRunResult != null) {
      previousRunHashes = new Set(
        previousRunResult.pairs.map(hashTrainServicePair),
      );
    }

    const mastodonClient = new MastodonClient(
      env.MASTODON_HOSTNAME,
      env.MASTODON_ACCESS_TOKEN,
    );

    for (const pair of trainServiceAlerts.pairs) {
      if (previousRunHashes.has(hashTrainServicePair(pair))) {
        continue;
      }

      const [, message] = pair;
      const postResponse = await mastodonClient.statusPost(message.Content);
      console.log({ message, postResponse });
    }

    const previousRunPairsByHash =
      new Map<string, TrainServiceSegmentMessagePair>();
    if (previousRunResult != null) {
      for (const pair of previousRunResult.pairs) {
        previousRunPairsByHash.set(hashTrainServicePair(pair), pair);
      }
    }

    const currentRunHashes = new Set(
      trainServiceAlerts.pairs.map(hashTrainServicePair),
    );

    // NOTE: Only post resolutions when transitioning from a non-normal to a normal
    // status. This is a best-effort check — it won't correctly handle multiple
    // simultaneous incidents since the status flag is global.
    if (
      trainServiceAlerts.status === TrainServiceStatus.NORMAL &&
      previousRunResult != null &&
      previousRunResult.status !== TrainServiceStatus.NORMAL
    ) {
      for (const [hash, pair] of previousRunPairsByHash) {
        if (currentRunHashes.has(hash)) continue;
        const [, message] = pair;
        const postResponse = await mastodonClient.statusPost(
          `**The following alert has been removed and overall status is now normal:**\n\n${message.Content}`,
        );
        console.log({ removed: message, postResponse });
      }
    }

    try {
      deepStrictEqual(previousRunResult, trainServiceAlerts);
    } catch (e) {
      console.error(e);
      await env.STORE.put(
        STORE_KEY_PREVIOUS_RUN_RESULT,
        JSON.stringify(trainServiceAlerts),
      );
    }
  },
};
