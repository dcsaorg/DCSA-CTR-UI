import {ParsedCTRRecord} from './records';
import {Config} from './config';

export type TabType = "platform" | "pint" | "ctr";
export const PINT_TRANSFER_ACTIONS = [
  "ACCEPTED (signed)",
  "REJECTED (signed)",
  "DISPUTED (signed)",
  "Non-PINT error (unsigned error)",
] as const;

export type PintTransferAnswer = typeof PINT_TRANSFER_ACTIONS[number];

export interface GamePreferences {
  alwaysShowAllTabs: boolean,
}

export function newGamePreferences(): GamePreferences {
  return {
    alwaysShowAllTabs: false
  }
}

export abstract class GameTab {

  _isDirty: boolean = false;

  _isActive: boolean = false;

  public get isDirty(): boolean {
    return this._isDirty;
  }

  public set isDirty(v: boolean) {
    if (!this.isActive) {
      this._isDirty = v;
    } else {
      this._isDirty = false;
    }
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public set isActive(v: boolean) {
    if (this._isActive || v) {
      this._isDirty = false;
    }
    this._isActive = v;
  }

  public get disabled(): boolean {
    return false;
  }

  public abstract get tabType(): TabType;

  public get tabCanBeOmitted(): boolean {
    return this.disabled;
  }

  public get debugName(): string {
    return this.tabType;
  }
}
export class PintTransferTab extends GameTab {

  public get tabType(): TabType {
    return "pint";
  }
}

export class CTRTab extends GameTab {

  public get tabType(): TabType {
    return "ctr";
  }
}

export class PintTransfer {
  private _answer: PintTransferAnswer | null = null;

  constructor(public readonly transferID: number,
              public readonly sender: string,
              public readonly receiver: string,
              ) {
  }

  public get isAnswered(): boolean {
    return this._answer !== null;
  }

  public get answer(): PintTransferAnswer|null {
    return this._answer;
  }

  public set answer(answer: PintTransferAnswer) {
    if (this._answer !== null) {
      throw new Error("Already answered");
    }
    this._answer = answer;
  }

}


export class Platform {
  visibleRecordLength: number = 0;
  hasCTRAccess: boolean = false;
  allPINTTransfers: PintTransfer[] = [];
  activeIncomingTransfers: PintTransfer[] = [];

  constructor(public readonly platformCode: string,
              public readonly game: CTRGame) {
  }

  public refreshCTRData(): void {
    this.visibleRecordLength = this.game.records.length;
  }

  public recordPublished(recordIdx: number, parsedCTRRecord: ParsedCTRRecord): void {
    const parsedPlatformRecord = parsedCTRRecord.parsedPlatformRecord;
    if (parsedPlatformRecord.actor === this.platformCode) {
      const length = recordIdx + 1;
      if (length > this.visibleRecordLength) {
        // If the platform successfully published a record, then it know the state at least
        // up to that record.
        this.visibleRecordLength = length;
      }
      // For the bootstrap case of issuing the eBL
      this.hasCTRAccess = true;
    }
    if (parsedPlatformRecord.action === 'INTEND TO TRANSFER' && parsedPlatformRecord.receiver === this.platformCode) {
      this.hasCTRAccess = true;
    }
  }
}

export class PlatformTab extends GameTab  {
  constructor(public platform: Platform) {
    super();
  }

  public override get disabled(): boolean {
    return !this.platform.hasCTRAccess && this.platform.activeIncomingTransfers.length < 1 && this.platform.allPINTTransfers.length < 1;
  }

  public get knownCTRRecords(): ParsedCTRRecord[] {
    const platform = this.platform;
    if (platform.game.records.length === this.platform.visibleRecordLength) {
      return platform.game.records;
    }
    return platform.game.records.splice(0, this.platform.visibleRecordLength);
  }

  public get tabType(): TabType {
    return "platform";
  }

  public override get debugName(): string {
    return this.platform.platformCode;
  }
}

export class CTRGame {

  ctrTab = new CTRTab();
  pintTab = new PintTransferTab();
  tabs: GameTab[];
  shownTabs: GameTab[];
  platforms: Platform[];
  platformTabByCode: Map<string, PlatformTab>;
  pintTransfers: PintTransfer[] = [];
  records: ParsedCTRRecord[] = [];
  private lastCheckedLength: number = 0;

  constructor(public eblID: string,
              config: Config,) {
    this.platforms = config.platforms.map(v => new Platform(v, this));
    this.platformTabByCode = new Map<string, PlatformTab>();
    this.tabs = this.platforms.map(p => new PlatformTab(p));
    for (const tab of this.tabs) {
      const platformTab = tab as PlatformTab
      this.platformTabByCode.set(platformTab.platform.platformCode, platformTab);
    }
    this.tabs.push(this.pintTab);
    this.tabs.push(this.ctrTab);
    this.shownTabs = this.tabs;
  }

  public get lastRecord(): ParsedCTRRecord | null {
    const records = this.records;
    if (records.length > 0) {
      return records[records.length - 1];
    }
    return null;
  }

  public get activeActors(): string[] | null {
    if (this.records.length < 1) {
      return null;
    }
    return this.platforms.filter(p => p.hasCTRAccess).map(p => p.platformCode);
  }

  public updateState(records: ParsedCTRRecord[]) {
    this.records = records;
    if (this.lastCheckedLength < records.length) {
      for (let i = this.lastCheckedLength; i < records.length; i++) {
        const record = records[i];
        for (const platform of this.platforms) {
          platform.recordPublished(i, record);
        }
      }
      this.ctrTab.isDirty = true;
      this.lastCheckedLength = records.length;
    }
  }

  pintTransferInitiated(pintTransfer: PintTransfer): void {
    const senderTab = this.platformTabByCode.get(pintTransfer.sender);
    const receiverTab = this.platformTabByCode.get(pintTransfer.receiver);
    if (!senderTab || !receiverTab) {
      return;
    }
    this.pintTransfers.push(pintTransfer);
    this.pintTab.isDirty = true;
    senderTab.platform.allPINTTransfers.push(pintTransfer);
    senderTab.isDirty = true;
    receiverTab.platform.allPINTTransfers.push(pintTransfer);
    receiverTab.platform.activeIncomingTransfers.push(pintTransfer);
    receiverTab.isDirty = true;
  }

  pintTransferAnswered(pintTransfer: PintTransfer): void {
    const senderTab = this.platformTabByCode.get(pintTransfer.sender);
    const receiverTab = this.platformTabByCode.get(pintTransfer.receiver);
    if (!senderTab || !receiverTab) {
      return;
    }
    this.pintTab.isDirty = true;
    senderTab.isDirty = true;
    receiverTab.platform.activeIncomingTransfers = receiverTab.platform.activeIncomingTransfers.filter((v) => v !== pintTransfer);
    receiverTab.isDirty = true;
  }
}
