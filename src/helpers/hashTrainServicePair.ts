import type { TrainServiceSegmentMessagePair } from '../clients/LtaDataMallClient';

export function hashTrainServicePair(
  pair: TrainServiceSegmentMessagePair,
): string {
  const [, message] = pair;

  return btoa([message.CreatedDate, message.Content].join(':'));
}
