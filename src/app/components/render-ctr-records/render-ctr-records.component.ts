import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CtrService} from '../../services/ctr.service';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {TagModule} from 'primeng/tag';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {AsyncPipe, JsonPipe, NgForOf, NgIf} from '@angular/common';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {DebounceClickDirective} from '../../directives/debounce-click.directive';
import {CalendarModule} from 'primeng/calendar';
import {BehaviorSubject, combineLatest, Observable, shareReplay, switchMap, tap, zip} from 'rxjs';
import {isValidEBLID, ParsedCTRRecord} from '../../models/records';
import {CreateCtrRecordComponent} from '../create-ctr-record/create-ctr-record.component';
import {TableModule} from 'primeng/table';
import {Column} from '../../models/table-models';

@Component({
  selector: 'app-render-ctr-records',
  templateUrl: './render-ctr-records.component.html',
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
    TableModule
  ]
})
export class RenderCtrRecordsComponent implements OnInit, OnChanges {

  @Input()
  eblID$?: Observable<string>;
  ctrRecords$?: Observable<ParsedCTRRecord[]>;
  ctrLoadingError: boolean = false;
  refresh$ = new BehaviorSubject<number>(0);

  columns: Column<ParsedCTRRecord>[] = [
    {
      title: "Record ID",
      value: (r) => r.recordID,
    },
    {
      title: "Actor",
      value: (r) => r.parsedPlatformRecord.actor,
    },
    {
      title: "Action",
      value: (r) => r.parsedPlatformRecord.action,
    },
    {
      title: "Receiver",
      value: (r) => r.parsedPlatformRecord.receiver ?? '(No receiver provided)',
    },
    {
      title: "Platform timestamp (perform time)",
      value: (r) => r.parsedPlatformRecord.platformActionTimestamp.toISOString(),
    },
    {
      title: "Last Envelope Transfer Chain Entry Signed Content Checksum",
      value: (r) => r.parsedPlatformRecord.lastEnvelopeTransferChainEntrySignedContentChecksum ?? '(No checksum provided)',
    },
    {
      title: "In Response To Record",
      value: (r) => r.parsedPlatformRecord.inResponseToRecord?.recordID ?? '(No record provided)',
    },
    {
      title: "Canonical Record",
      value: (r) => r.parsedPlatformRecord.canonicalRecord?.recordID ?? '(No record provided)',
    },
    {
      title: "Previous Record",
      value: (r) => r.parsedPlatformRecord.previousRecord?.recordID ?? '(No record provided)',
    },
    {
      title: "CTR timestamp (insert time)",
      value: (r) => r.insertedAtTimestamp.toISOString(),
    },
    {
      title: "Inserted by (CTR auth)",
      value: (r) => r.insertedBy,
    },
  ]

  constructor(private ctrService: CtrService,
              ) {
  }

  private startPipeline(): void {
    const eblID$ = this.eblID$;
    if (!eblID$) {
      return;
    }
    this.ctrRecords$ = combineLatest([eblID$, this.refresh$]).pipe(
      switchMap(data => {
        console.log("Load:", data);
        return this.ctrService.getRecordsForEBL(data[0]);
      }),
      tap({
        next: (_) => {
          this.ctrLoadingError = false;
        },
        error: (_) => {
          this.ctrLoadingError = true;
        }
      }),
    );
  }

  ngOnInit(): void {
    this.startPipeline();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.startPipeline();
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

  refresh(): void {
    this.refresh$.next(this.refresh$.value + 1);
  }
}
