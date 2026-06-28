import type { TrainServiceSegmentMessagePair } from '../clients/LtaDataMallClient';

const EMERGENCY_ALERT_PREFIX = '[EMERGENCY ALERT]';

export function formatTrainServiceAlertPost(
  pair: TrainServiceSegmentMessagePair,
): string {
  const [segment, message] = pair;

  if (segment == null) {
    return `${EMERGENCY_ALERT_PREFIX}\n\n${message.Content}`;
  }

  return message.Content;
}
