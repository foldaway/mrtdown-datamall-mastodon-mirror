import { expect, test } from 'vitest';
import type {
  TrainLine,
  TrainServiceSegmentMessagePair,
} from '../clients/LtaDataMallClient';
import {
  formatTrainServiceAlertPost,
  formatTrainServiceAlertRemovalPost,
} from './formatTrainServiceAlertPost';

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

test('formats removed segmented train alerts as normal service resolutions', () => {
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

  expect(formatTrainServiceAlertRemovalPost(pair)).toBe(
    '**The following alert has been removed and overall status is now normal:**\n\nTrain service delayed.',
  );
});

test('prefixes segmentless alerts as non-train emergency alerts', () => {
  const pair: TrainServiceSegmentMessagePair = [
    null,
    {
      Content: 'Road closure affecting bus services.',
      CreatedDate: '2026-06-28T03:00:00',
    },
  ];

  expect(formatTrainServiceAlertPost(pair)).toBe(
    '[LTA NON-TRAIN EMERGENCY ALERT]\n\nRoad closure affecting bus services.',
  );
});

test('formats removed segmentless alerts without train status resolution copy', () => {
  const pair: TrainServiceSegmentMessagePair = [
    null,
    {
      Content: 'Road closure affecting bus services.',
      CreatedDate: '2026-06-28T03:00:00',
    },
  ];

  expect(formatTrainServiceAlertRemovalPost(pair)).toBe(
    '**The following non-train emergency alert has been removed from DataMall:**\n\n[LTA NON-TRAIN EMERGENCY ALERT]\n\nRoad closure affecting bus services.',
  );
});
