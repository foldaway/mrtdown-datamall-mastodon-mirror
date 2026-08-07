import type { TrainServiceSegmentMessagePair } from '../clients/LtaDataMallClient';

// The mirror's production history shows that segmentless off-topic broadcasts
// identify themselves as bus or road/traffic notices. Prefer that narrow,
// observed exclusion over guessing every way LTA might phrase a rail update: a
// genuine rail alert has also appeared without AffectedSegments.
const NON_RAIL_EMERGENCY_TERMS =
  /\b(?:bus|buses|road|roads|roadworks|traffic)\b/i;
const RAIL_SERVICE_TERMS =
  /\b(?:train|trains|rail|mrt|lrt|line|station|stations|platform|platforms)\b|(?:^|[^a-z0-9])(?:bpl|ccl|cgl|dtl|ewl|nel|nsl|pel|pwl|sel|swl|tel)(?:[^a-z0-9]|$)/i;

export enum TrainServiceAlertRelevance {
  RELEVANT = 'relevant',
  IRRELEVANT = 'irrelevant',
  UNKNOWN = 'unknown',
}

export function classifyTrainServiceAlert([
  segment,
  message,
]: TrainServiceSegmentMessagePair): TrainServiceAlertRelevance {
  if (segment != null) return TrainServiceAlertRelevance.RELEVANT;

  // Rail evidence takes precedence because disruption updates commonly mention
  // replacement/public buses or road incidents as part of the same alert.
  if (RAIL_SERVICE_TERMS.test(message.Content)) {
    return TrainServiceAlertRelevance.RELEVANT;
  }

  if (NON_RAIL_EMERGENCY_TERMS.test(message.Content)) {
    return TrainServiceAlertRelevance.IRRELEVANT;
  }

  return TrainServiceAlertRelevance.UNKNOWN;
}
