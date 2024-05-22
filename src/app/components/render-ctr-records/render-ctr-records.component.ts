import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CtrService} from '../../services/ctr.service';
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
import {BehaviorSubject, combineLatest, map, Observable, shareReplay, switchMap, tap} from 'rxjs';
import {isValidEBLID, ParsedCTRRecord} from '../../models/records';
import {CreateCtrRecordComponent} from '../create-ctr-record/create-ctr-record.component';
import {TableModule} from 'primeng/table';
import {CtrRecordTableComponent} from '../ctr-record-table/ctr-record-table.component';

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
    TableModule,
    NgSwitch,
    NgSwitchDefault,
    NgSwitchCase,
    SlicePipe,
    CtrRecordTableComponent
  ]
})
export class RenderCtrRecordsComponent implements OnInit, OnChanges {

  @Input()
  eblID$?: Observable<string>;
  ctrRecords$?: Observable<ParsedCTRRecord[]>;
  ctrRecordTable$?: Observable<Map<string, ParsedCTRRecord>>;
  ctrLoadingError: boolean = false;
  refresh$ = new BehaviorSubject<number>(0);


  constructor(private ctrService: CtrService,
              ) {
  }

  private startPipeline(): void {
    const eblID$ = this.eblID$;
    if (!eblID$) {
      return;
    }
    const ctrRecords$ = combineLatest([eblID$, this.refresh$]).pipe(
      switchMap(data => {
        console.log("Load:", data);
        return this.ctrService.getRecordsForEBL(data[0]);
      }),
      shareReplay({
        refCount: true,
        bufferSize: 1,
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
    this.ctrRecords$ = ctrRecords$;
    this.ctrRecordTable$ = ctrRecords$.pipe(
      map(records => {
        const m = new Map<string, ParsedCTRRecord>();
        for (const r of records) {
          m.set(r.recordID, r);
        }
        return m;
      }),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
    );
  }

  ngOnInit(): void {
    this.startPipeline();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.startPipeline();
  }

  eblIDHasValidForm(eblID: string): boolean {
    return isValidEBLID(eblID);
  }

  refresh(): void {
    this.refresh$.next(this.refresh$.value + 1);
  }
}
