import { deepStrictEqual } from 'node:assert';
import {
  LtaDataMallClient,
  type TrainServiceAlertsResult,
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
