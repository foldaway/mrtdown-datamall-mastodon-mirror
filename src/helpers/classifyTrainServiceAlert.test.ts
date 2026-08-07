import { expect, test } from 'vitest';
import type {
  TrainLine,
  TrainServiceSegmentMessagePair,
} from '../clients/LtaDataMallClient';
import {
  classifyTrainServiceAlert,
  TrainServiceAlertRelevance,
} from './classifyTrainServiceAlert';

function segmentless(content: string): TrainServiceSegmentMessagePair {
  return [null, { Content: content, CreatedDate: '2026-08-07T03:00:00' }];
}

test('keeps alerts with an affected train segment', () => {
  const pair: TrainServiceSegmentMessagePair = [
    {
      Line: 'EWL' as TrainLine,
      Direction: 'Both',
      Stations: 'EW1 - EW2',
      FreePublicBus: '',
      FreeMRTShuttle: '',
      MRTShuttleDirection: '',
    },
    { Content: 'Service update.', CreatedDate: '2026-08-07T03:00:00' },
  ];

  expect(classifyTrainServiceAlert(pair)).toBe(
    TrainServiceAlertRelevance.RELEVANT,
  );
});

test('keeps the production failure mode of a segmentless train update', () => {
  expect(
    classifyTrainServiceAlert(
      segmentless('Train service on the East-West Line is delayed.'),
    ),
  ).toBe(TrainServiceAlertRelevance.UNKNOWN);
});

test('keeps an unrecognised segmentless emergency rather than losing an update', () => {
  expect(
    classifyTrainServiceAlert(
      segmentless('Emergency exercise in progress. Please avoid the area.'),
    ),
  ).toBe(TrainServiceAlertRelevance.UNKNOWN);
});

test.each([
  'Bus services are diverted due to a road closure.',
  'Traffic is heavy along Orchard Road.',
  'Buses will skip two stops because of roadworks.',
])('drops an unrelated segmentless emergency message: %s', (content) => {
  expect(classifyTrainServiceAlert(segmentless(content))).toBe(
    TrainServiceAlertRelevance.IRRELEVANT,
  );
});
