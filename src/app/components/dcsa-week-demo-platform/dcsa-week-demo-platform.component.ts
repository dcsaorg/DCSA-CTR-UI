import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {RenderCtrRecordsComponent} from '../render-ctr-records/render-ctr-records.component';
import {TabViewModule} from 'primeng/tabview';
import {CtrService} from '../../services/ctr.service';
import {Globals} from '../../models/globals';
import {
  AsyncPipe,
  JsonPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  SlicePipe
} from '@angular/common';
import {TagModule} from 'primeng/tag';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {BadgeModule} from 'primeng/badge';
import {CtrRecordTableComponent} from '../ctr-record-table/ctr-record-table.component';
import {CardModule} from 'primeng/card';
import {InputSwitchModule} from 'primeng/inputswitch';
import {FormsModule} from '@angular/forms';
import {TransactionGameConfigComponent} from '../transaction-game-config/transaction-game-config.component';
import {ParsedCTRRecord, PlatformRecord} from '../../models/records';
import {CreateCtrRecordComponent} from '../create-ctr-record/create-ctr-record.component';
import {CreatePintTransferComponent} from '../create-pint-transfer/create-pint-transfer.component';
import {TableModule} from 'primeng/table';
import {AccordionModule} from 'primeng/accordion';
import {RenderPintTransfersComponent} from '../render-pint-transfers/render-pint-transfers.component';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {EBLS, PlatformUser} from '../../models/dcsa-week-demo';
import {RenderDcsaEblComponent} from '../render-dcsa-ebl/render-dcsa-ebl.component';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {DebounceClickDirective} from '../../directives/debounce-click.directive';
import {FloatLabelModule} from 'primeng/floatlabel';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {Config} from '../../models/config';
import shajs from 'sha.js';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-dcsa-week-demo-platform',
  templateUrl: './dcsa-week-demo-platform.component.html',
  styles: [
    '.p-button.accept-button { background: green }',
    '.p-button.accept-button.p-component:disabled { background: darkgrey }',
    '.p-button.reject-button { background: yellow; color: black }',
    '.p-button.reject-button.p-component:disabled { background: darkgrey; color: #F8F7F7; }',
    '.p-button.dispute-button { background: red }',
    '.p-button.dispute-button.p-component:disabled { background: darkgrey }',
    '.button-loading { background: yellow; color: black; }',
    '.button-loading:focus { box-shadow: 0 0 0 0.2rem yellow; }',
    //
  ],
  standalone: true,
  imports: [
    RenderCtrRecordsComponent,
    TabViewModule,
    AsyncPipe,
    NgIf,
    TagModule,
    ProgressSpinnerModule,
    NgForOf,
    NgSwitchCase,
    SlicePipe,
    NgSwitch,
    NgSwitchDefault,
    BadgeModule,
    CtrRecordTableComponent,
    JsonPipe,
    CardModule,
    InputSwitchModule,
    FormsModule,
    TransactionGameConfigComponent,
    CreateCtrRecordComponent,
    NgClass,
    CreatePintTransferComponent,
    TableModule,
    AccordionModule,
    RenderPintTransfersComponent,
    ToastModule,
    RenderDcsaEblComponent,
    DialogModule,
    ButtonModule,
    DebounceClickDirective,
    FloatLabelModule,
    InputTextModule,
    DropdownModule
  ]
})
export class DcsaWeekDemoPlatformComponent implements OnInit, OnChanges {

  @Input()
  ebl = EBLS.mscEbl;

  @Input()
  platformUser: PlatformUser = {
    platform: "",
    name: ""
  };

  @Input()
  eblChecksum = "";

  @Input()
  ctrRecords: ParsedCTRRecord[] = [];

  @Input()
  ctrRecordTable = new Map<string, ParsedCTRRecord>();

  @Output()
  ctrRecordCreated = new EventEmitter<ParsedCTRRecord>();


  eblVisible: boolean = false;
  receiver?: PlatformUser;
  transferStarted: boolean = false;
  selectableUsers: PlatformUser[] = [];

  constructor(private ctrService: CtrService,
              private messageService: MessageService,
              private globals: Globals,
  ) {
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateFilters();
  }

  ngOnInit(): void {
    this.updateFilters();
  }

  private updateFilters(): void {
    this.selectableUsers = this.config.demoUsers.filter(p => p.platform !== this.platformUser.platform);
  }

  public get config(): Config {
    return this.globals.config!;
  }

  public initiateTransfer(): void {
    const receiver = this.receiver;
    if (!receiver) {
      return;
    }
    this.transferStarted = true;
    const sha256HashFunc = shajs('sha256');
    // We are just making this one up.
    const lastEnvelopeTransferChainEntrySignedContentChecksum = sha256HashFunc.update(uuidv4()).digest('hex');
    const ctrRecords = this.ctrRecords;
    const platformRecord: PlatformRecord = {
      eblID: this.eblChecksum,
      action: "INTEND TO TRANSFER",
      actor: this.platformUser.platform,
      receiver: receiver.platform,
      lastEnvelopeTransferChainEntrySignedContentChecksum: lastEnvelopeTransferChainEntrySignedContentChecksum,
      canonicalRecord: undefined,
      inResponseToRecord: undefined,
      platformActionTimestamp: new Date().getTime(),
      previousRecord: ctrRecords.length > 0 ? ctrRecords[ctrRecords.length - 1].recordID : undefined,
    };
    this.createRecord(platformRecord);
    this.messageService.add({
      key: 'GenericSuccessToast',
      severity: 'success',
      summary: `Transfer initiated`,
      detail: 'CTR updated with an INTEND TO TRANSFER and the eBL transfer initiated'
    });
  }

  private findIntendToTransferRecord(ctrRecords: ParsedCTRRecord[]): ParsedCTRRecord|undefined {
    for (let idx = ctrRecords.length - 1 ; idx >= 0 ; idx--) {
      const currentRecord = ctrRecords[idx];
      if (currentRecord.parsedPlatformRecord.actor !== this.platformUser.platform) {
        continue;
      }
      if (currentRecord.parsedPlatformRecord.receiver === this.receiver?.platform && currentRecord.parsedPlatformRecord.action === "INTEND TO TRANSFER") {
        return currentRecord;
      }
    }
    return;
  }

  private createRecord(platformRecord: PlatformRecord): void {
    const ctrRecords = this.ctrRecords;
    const ctrRecordTable = this.ctrRecordTable;
    const ctrRecord = this.ctrService.generatePlatformRecord(platformRecord, ctrRecords, ctrRecordTable);
    this.ctrRecordCreated.emit(ctrRecord);
  }

  acceptTransfer(): void {
    const ctrRecords = this.ctrRecords;
    const receiver = this.receiver;
    if (receiver === undefined || ctrRecords.length < 1) {
      return;
    }
    const transferRecord = this.findIntendToTransferRecord(ctrRecords);
    if (!transferRecord) {
      return;
    }
    const platformRecord: PlatformRecord = {
      eblID: this.eblChecksum,
      action: "TRANSFER ACCEPTED",
      actor: receiver.platform,
      receiver: undefined,
      canonicalRecord: undefined,
      inResponseToRecord: transferRecord.recordID,
      platformActionTimestamp: new Date().getTime(),
      previousRecord: ctrRecords[ctrRecords.length - 1].recordID,
    };
    this.createRecord(platformRecord);
    this.transferStarted = false;
    this.messageService.add({
      key: 'GenericSuccessToast',
      severity: 'success',
      summary: "Transfer complete",
      detail: 'Transfer accepted and CTR updated with a TRANSFER ACCEPTED'
    });
  }

  rejectRecord(): void {
    const ctrRecords = this.ctrRecords;
    if (ctrRecords.length < 1) {
      return;
    }
    const transferRecord = this.findIntendToTransferRecord(ctrRecords);
    if (!transferRecord) {
      return;
    }
    const platformRecord: PlatformRecord = {
      eblID: this.eblChecksum,
      action: "CANCEL TRANSFER",
      actor: this.platformUser.platform,
      receiver: undefined,
      canonicalRecord: undefined,
      inResponseToRecord: transferRecord.recordID,
      platformActionTimestamp: new Date().getTime(),
      previousRecord: ctrRecords[ctrRecords.length - 1].recordID,
    };
    this.createRecord (platformRecord);
    this.messageService.add({
      key: 'GenericSuccessToast',
      severity: 'success',
      summary: "Rejected transfer successful",
      detail: 'Transfer rejected.'
    });
    this.transferStarted = false;
  }

  disputeRecord(): void {
    const ctrRecords = this.ctrRecords;
    const receiver = this.receiver;
    if (!receiver || ctrRecords.length < 1) {
      return;
    }
    const platformRecord: PlatformRecord = {
      eblID: this.eblChecksum,
      action: "DISPUTE RECORD",
      actor: receiver.platform,
      receiver: undefined,
      canonicalRecord: undefined,
      inResponseToRecord: ctrRecords[ctrRecords.length - 1].recordID,
      platformActionTimestamp: new Date().getTime(),
      previousRecord: ctrRecords[ctrRecords.length - 1].recordID,
    };
    this.createRecord(platformRecord);
    this.transferStarted = false;
    this.messageService.add({
      key: 'GenericSuccessToast',
      severity: 'success',
      summary: "The eBL state successfully disputed",
      detail: 'Transfer rejected and CTR updated with a DISPUTE RECORD'
    });
  }
}
