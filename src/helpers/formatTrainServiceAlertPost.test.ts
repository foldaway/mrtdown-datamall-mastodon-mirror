import { expect, test } from 'vitest';
import type {
  TrainLine,
  TrainServiceSegmentMessagePair,
} from '../clients/LtaDataMallClient';
import { formatTrainServiceAlertPost } from './formatTrainServiceAlertPost';

test('formats segmented train alerts without an extra prefix', () => {
  const pair: TrainServiceSegmentMessagePair = [
    {
      Line: 'EWL' as TrainLine,
      Direction: 'Both',
      Stations: 'EW1 - EW2',
      FreePublicBus: '',
      FreeMRTShuttle: '',
      MRTShuttleDirection: '',
    },
    {
      Content: 'Train service delayed.',
      CreatedDate: '2026-06-28T03:00:00',
    },
  ];

  expect(formatTrainServiceAlertPost(pair)).toBe('Train service delayed.');
});

test('prefixes segmentless alerts as emergency alerts', () => {
  const pair: TrainServiceSegmentMessagePair = [
    null,
    {
      Content: 'Road closure affecting bus services.',
      CreatedDate: '2026-06-28T03:00:00',
    },
  ];

  expect(formatTrainServiceAlertPost(pair)).toBe(
    '[EMERGENCY ALERT]\n\nRoad closure affecting bus services.',
  );
});
