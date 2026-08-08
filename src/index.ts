import { deepStrictEqual } from 'node:assert';
import {
  LtaDataMallClient,
  type TrainServiceAlertsResult,
  type TrainServiceSegmentMessagePair,
  TrainServiceStatus,
} from './clients/LtaDataMallClient';
import { MastodonClient } from './clients/MastodonClient';
import {
  classifyTrainServiceAlert,
  TrainServiceAlertRelevance,
} from './helpers/classifyTrainServiceAlert';
import {
  formatTrainServiceAlertPost,
  formatTrainServiceAlertRemovalPost,
} from './helpers/formatTrainServiceAlertPost';
import { hashTrainServicePair } from './helpers/hashTrainServicePair';

const STORE_KEY_PREVIOUS_RUN_RESULT = 'previous_run.result';

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ) {
    const datamallClient = new LtaDataMallClient(env.LTA_DATAMALL_ACCOUNT_KEY);
    const trainServiceAlerts = await datamallClient.trainServiceAlerts();
    trainServiceAlerts.pairs = trainServiceAlerts.pairs.filter((pair) => {
      const relevance = classifyTrainServiceAlert(pair);
      if (relevance === TrainServiceAlertRelevance.IRRELEVANT) {
        console.log({ discardedTrainServiceAlert: pair, relevance });
        return false;
      }
      return true;
    });
    console.log({ trainServiceAlerts });

    const storedPreviousRunResult =
      await env.STORE.get<TrainServiceAlertsResult>(
        STORE_KEY_PREVIOUS_RUN_RESULT,
        'json',
      );
    const previousRunResult =
      storedPreviousRunResult == null
        ? null
        : {
            ...storedPreviousRunResult,
            pairs: storedPreviousRunResult.pairs.filter(
              (pair) =>
                classifyTrainServiceAlert(pair) !==
                TrainServiceAlertRelevance.IRRELEVANT,
            ),
          };
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
      const postResponse = await mastodonClient.statusPost(
        formatTrainServiceAlertPost(pair),
      );
      console.log({ message, postResponse });
    }

    const previousRunPairsByHash = new Map<
      string,
      TrainServiceSegmentMessagePair
    >();
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
          formatTrainServiceAlertRemovalPost(pair),
        );
        console.log({ removed: message, postResponse });
      }
    }

    try {
      // Compare against the stored (unnormalized) value so deployment also
      // removes legacy irrelevant pairs from KV when everything else is equal.
      deepStrictEqual(storedPreviousRunResult, trainServiceAlerts);
    } catch (e) {
      console.error(e);
      await env.STORE.put(
        STORE_KEY_PREVIOUS_RUN_RESULT,
        JSON.stringify(trainServiceAlerts),
      );
    }
  },
};
