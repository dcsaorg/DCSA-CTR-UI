export const PLATFORM_ACTIONS = [
  "INTEND TO TRANSFER",
  "CANCEL TRANSFER",
  "TRANSFER ACCEPTED",
  "RETRACT RECORD",
  "DISPUTE RECORD",
  "DISPUTE RECORD RESOLVED",
  "SURRENDERED",
] as const;

const HEX_PATTERN = new RegExp('^[0-9a-f]+$');
export function isValidEBLID(eblID?: string): boolean {
  if (!eblID) {
    return false
  }
  return eblID.length == 64 && HEX_PATTERN.test(eblID);
}


export type PlatformAction = typeof PLATFORM_ACTIONS[number];

export interface PlatformRecord {
  eblID: string;
  action: PlatformAction;
  actor: string;
  receiver?: string;
  lastEnvelopeTransferChainEntrySignedContentChecksum?: string;
  canonicalRecord?: string;
  inResponseToRecord?: string;
  platformActionTimestamp: number;
  previousRecord?: string;
}

export interface CTRRecord {
  readonly insertedBy: string;
  readonly insertedAtTimestamp: number;
  readonly platformRecordSignedContent: string;
}

export interface ParsedPlatformRecord {
  readonly eblID: string;
  readonly action: PlatformAction;
  readonly actor: string;
  readonly receiver?: string;
  readonly lastEnvelopeTransferChainEntrySignedContentChecksum?: string;
  readonly canonicalRecord?: ParsedCTRRecord;
  readonly inResponseToRecord?: ParsedCTRRecord;
  readonly platformActionTimestamp: Date;
  readonly previousRecord?: ParsedCTRRecord;
}


export interface ParsedCTRRecord {
  readonly recordID: string;
  readonly recordNumber: number;
  readonly insertedBy: string;
  readonly insertedAtTimestamp: Date;
  readonly parsedPlatformRecord: ParsedPlatformRecord;
}
