import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
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
import {CreateCtrRecordComponent} from '../create-ctr-record/create-ctr-record.component';
import {TableEditCompleteEvent, TableModule} from 'primeng/table';
import {CtrRecordTableComponent} from '../ctr-record-table/ctr-record-table.component';
import {PINT_TRANSFER_ACTIONS, PintTransfer, PintTransferAnswer} from '../../models/game-model';

@Component({
  selector: 'app-render-pint-transfers',
  templateUrl: './render-pint-transfers.component.html',
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
export class RenderPintTransfersComponent {

  @Input()
  pintTransfers?: PintTransfer[];

  @Input()
  allowAnswering: boolean = false;

  @Output()
  answered = new EventEmitter<PintTransfer>();

  pintTransferActions: PintTransferAnswer[] = [... PINT_TRANSFER_ACTIONS];

  constructor() {
  }

  trackByIndexFunction(index: number, _record: any): number {
    return index;
  }

  onEditComplete($event: TableEditCompleteEvent): void {
    console.log($event);

  }

  onAnswerChange(row: PintTransfer): void {
    if (row.isAnswered) {
      this.answered.emit(row)
    }
  }
}
