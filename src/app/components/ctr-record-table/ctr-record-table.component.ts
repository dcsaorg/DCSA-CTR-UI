import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {TagModule} from 'primeng/tag';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {AsyncPipe, JsonPipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, SlicePipe} from '@angular/common';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {DebounceClickDirective} from '../../directives/debounce-click.directive';
import {CalendarModule} from 'primeng/calendar';
import {isValidEBLID, ParsedCTRRecord} from '../../models/records';
import {CreateCtrRecordComponent} from '../create-ctr-record/create-ctr-record.component';
import {TableModule} from 'primeng/table';
import {Column} from '../../models/table-models';
import {ToolbarModule} from 'primeng/toolbar';

interface CtrColumn<T> extends Column<T> {
  dcsaWeekDemoField: boolean
}

@Component({
  selector: 'app-ctr-record-table',
  templateUrl: './ctr-record-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    TagModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    NgIf,
    ProgressSpinnerModule,
    DebounceClickDirective,
    JsonPipe,
    CalendarModule,
    RouterLink,
    AsyncPipe,
    NgForOf,
    CreateCtrRecordComponent,
    TableModule,
    NgSwitch,
    NgSwitchDefault,
    NgSwitchCase,
    SlicePipe,
    ToolbarModule
  ]
})
export class CtrRecordTableComponent implements OnInit, OnChanges {

  @Input()
  eblID: string|null = null;

  @Input()
  ctrRecords: ParsedCTRRecord[] = [];

  @Input()
  loading: boolean = false;

  @Input()
  ctrLoadingError: boolean = false;

  @Input()
  dcsaDemo: boolean = false;

  ctrRecordTable: Map<string, ParsedCTRRecord> = new Map<string, ParsedCTRRecord>();

  allColumns: CtrColumn<ParsedCTRRecord>[] = [
    {
      title: "EBL ID",
      contentType: "checksum",
      dcsaWeekDemoField: true,
      value: (r) => r.parsedPlatformRecord.eblID,
    },
    {
      title: "Actor",
      contentType: "string",
      dcsaWeekDemoField: true,
      value: (r) => r.parsedPlatformRecord.actor,
    },
    {
      title: "Action",
      contentType: "string",
      dcsaWeekDemoField: true,
      value: (r) => r.parsedPlatformRecord.action,
    },
    {
      title: "Receiver",
      contentType: "string",
      dcsaWeekDemoField: true,
      value: (r) => r.parsedPlatformRecord.receiver ?? '(No receiver provided)',
    },
    {
      title: "Platform timestamp (perform time)",
      contentType: "string",
      dcsaWeekDemoField: true,
      value: (r) => r.parsedPlatformRecord.platformActionTimestamp.toISOString(),
    },
    {
      title: "Last Envelope Transfer Chain Entry Signed Content Checksum",
      contentType: "checksum",
      dcsaWeekDemoField: false,
      value: (r) => r.parsedPlatformRecord.lastEnvelopeTransferChainEntrySignedContentChecksum ?? null,
    },
    {
      title: "In Response To Record",
      contentType: "platformRecordID",
      dcsaWeekDemoField: true,
      value: (r) => r.parsedPlatformRecord.inResponseToRecord?.recordID ?? null,
    },
    {
      title: "Canonical Record",
      contentType: "platformRecordID",
      dcsaWeekDemoField: true,
      value: (r) => r.parsedPlatformRecord.canonicalRecord?.recordID ?? null,
    },
    {
      title: "Record ID",
      contentType: "platformRecordID",
      dcsaWeekDemoField: true,
      value: (r) => r.recordID,
    },
    {
      title: "Previous Record",
      contentType: "platformRecordID",
      dcsaWeekDemoField: true,
      value: (r) => r.parsedPlatformRecord.previousRecord?.recordID ?? null,
    },
    {
      title: "CTR timestamp (insert time)",
      contentType: "string",
      dcsaWeekDemoField: false,
      value: (r) => r.insertedAtTimestamp.toISOString(),
    },
    {
      title: "Inserted by (CTR auth)",
      contentType: "string",
      dcsaWeekDemoField: false,
      value: (r) => r.insertedBy,
    },
  ]

  columns = this.allColumns;
  rows: ParsedCTRRecord[] = [];

  constructor() {
  }

  private update(): void {
    const m = new Map<string, ParsedCTRRecord>();
    for (const r of this.ctrRecords) {
      m.set(r.recordID, r);
    }
    this.ctrRecordTable = m;
    if (this.dcsaDemo) {
      this.columns = this.allColumns.filter(v => v.dcsaWeekDemoField);
    } else {
      this.columns = this.allColumns
    }
    this.rows = [... this.ctrRecords].reverse();
  }

  ngOnInit(): void {
    this.update();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.update();
  }

  trackByFunction(_index: number, record: ParsedCTRRecord): any {
    return record.recordID;
  }

  // Work around templates losing type information
  asColumns(untyped: any): Column<ParsedCTRRecord>[] {
    return untyped;
  }

  eblIDHasValidForm(eblID: string): boolean {
    return isValidEBLID(eblID);
  }
}
