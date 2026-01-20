export enum TrainServiceStatus {
  NORMAL = 1,
  DISRUPTED = 2,
}

export enum TrainLine {
  CIRCLE_LINE = 'CCL',
  CIRCLE_LINE_MARINA_EXTENSION = 'CEL', // BayFront, Marina Bay
  EAST_WEST_LINE_CHANGI_EXTENSION = 'CGL', // Expo, Changi Airport
  EAST_WEST_LINE = 'EWL',
  DOWNTOWN_LINE = 'DTL',
  NORTH_EAST_LINE = 'NEL',
  NORTH_SOUTH_LINE = 'NSL',
  PUNGGOL_LRT_EAST_LOOP = 'PEL',
  PUNGGOL_LRT_WEST_LOOP = 'PWL',
  SENGKANG_LRT_EAST_LOOP = 'SEL',
  SENGKANG_LRT_WEST_LOOP = 'SWL',
  BUKIT_PANJANG_LRT = 'BPL',
}

interface Segment {
  Line: TrainLine;
  Direction: string;
  Stations: string;
  FreePublicBus: string;
  FreeMRTShuttle: string;
  MRTShuttleDirection: string;
}

interface Message {
  Content: string;
  CreatedDate: string;
}

interface TrainServiceAlertsResponse {
  'odata.metadata': string;
  value: {
    Status: TrainServiceStatus;
    // NOTE: This is sometimes empty for some reason
    AffectedSegments: Segment[];
    Message: Message[];
  };
}

export type TrainServiceSegmentMessagePair = [Segment | null, Message];

export interface TrainServiceAlertsResult {
  status: TrainServiceStatus;
  pairs: TrainServiceSegmentMessagePair[];
}

export class LtaDataMallClient {
  private accountKey: string;

  constructor(accountKey: string) {
    this.accountKey = accountKey;
  }

  async trainServiceAlerts(): Promise<TrainServiceAlertsResult> {
    const response = await fetch(
      'https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts',
      {
        headers: {
          AccountKey: this.accountKey,
        },
      },
    );

    const data: TrainServiceAlertsResponse = await response.json();

    const pairs: TrainServiceSegmentMessagePair[] = [];
    for (let i = 0; i < data.value.Message.length; i++) {
      const segment = data.value.AffectedSegments[i] ?? null;
      const message = data.value.Message[i];

      pairs.push([segment, message]);
    }

    return {
      status: data.value.Status,
      pairs,
    };
  }
}
