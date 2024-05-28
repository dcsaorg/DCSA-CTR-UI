import {Component, computed, signal} from '@angular/core';
import {RenderCtrRecordsComponent} from '../render-ctr-records/render-ctr-records.component';
import {TabViewModule} from 'primeng/tabview';
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
import {ParsedCTRRecord} from '../../models/records';
import {CreateCtrRecordComponent} from '../create-ctr-record/create-ctr-record.component';
import {CreatePintTransferComponent} from '../create-pint-transfer/create-pint-transfer.component';
import {TableModule} from 'primeng/table';
import {AccordionModule} from 'primeng/accordion';
import {RenderPintTransfersComponent} from '../render-pint-transfers/render-pint-transfers.component';
import {ToastModule} from 'primeng/toast';
import {EBLS} from '../../models/dcsa-week-demo';
import {RenderDcsaEblComponent} from '../render-dcsa-ebl/render-dcsa-ebl.component';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {DebounceClickDirective} from '../../directives/debounce-click.directive';
import {FloatLabelModule} from 'primeng/floatlabel';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {Config} from '../../models/config';
import canonicalize from 'canonicalize';
import shajs from 'sha.js';
import {DcsaWeekDemoPlatformComponent} from '../dcsa-week-demo-platform/dcsa-week-demo-platform.component';

@Component({
  selector: 'app-dcsa-week-demo',
  templateUrl: './dcsa-week-demo.component.html',
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
    DropdownModule,
    DcsaWeekDemoPlatformComponent
  ]
})
export class DcsaWeekDemoComponent {

  ebl = signal(EBLS.mscEbl);
  eblChecksum = computed(() => {
    let canonical;
    try {
      canonical = canonicalize(JSON.parse(JSON.stringify(this.ebl())));
    } catch (e) {
      return "?";
    }
    if (canonical === undefined) {
      return "?";
    }
    const sha256HashFunc = shajs('sha256');
    return sha256HashFunc.update(canonical).digest('hex');
  })
  ctrRecords: ParsedCTRRecord[] = [];
  ctrRecordTable = new Map<string, ParsedCTRRecord>();

  constructor(private globals: Globals,
              ) {
  }


  public get config(): Config {
    return this.globals.config!;
  }

  newCtrRecord(ctrRecord: ParsedCTRRecord): void {
    const ctrRecordTable = this.ctrRecordTable;
    // Copy to force update in the UI (template)
    const ctrRecords =  [... this.ctrRecords];
    ctrRecordTable.set(ctrRecord.recordID, ctrRecord);
    ctrRecords.push(ctrRecord)
    this.ctrRecords = ctrRecords;
  }
}
