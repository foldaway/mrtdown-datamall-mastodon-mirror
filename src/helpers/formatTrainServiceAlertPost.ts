import type { TrainServiceSegmentMessagePair } from '../clients/LtaDataMallClient';

const EMERGENCY_ALERT_PREFIX = '[LTA EMERGENCY ALERT]';
const TRAIN_ALERT_REMOVAL_PREFIX =
  '**The following alert has been removed and overall status is now normal:**';
const EMERGENCY_ALERT_REMOVAL_PREFIX =
  '**The following emergency alert has been removed from DataMall:**';

export function formatTrainServiceAlertPost(
  pair: TrainServiceSegmentMessagePair,
): string {
  const [segment, message] = pair;

  if (segment == null) {
    return `${EMERGENCY_ALERT_PREFIX}\n\n${message.Content}`;
  }

  return message.Content;
}

export function formatTrainServiceAlertRemovalPost(
  pair: TrainServiceSegmentMessagePair,
): string {
  const [segment] = pair;
  const prefix =
    segment == null
      ? EMERGENCY_ALERT_REMOVAL_PREFIX
      : TRAIN_ALERT_REMOVAL_PREFIX;

  return `${prefix}\n\n${formatTrainServiceAlertPost(pair)}`;
}
