import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {first} from 'rxjs';
import {ConfirmationService, MessageService} from 'primeng/api';
import {CtrService} from '../../services/ctr.service';
import {isValidEBLID, ParsedCTRRecord, PLATFORM_ACTIONS, PlatformAction, PlatformRecord} from '../../models/records';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ErrorMessageExtractor} from '../../util/error-message-extractor';
import {JsonPipe, NgIf} from '@angular/common';
import {Config} from '../../models/config';
import {Globals} from '../../models/globals';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {DebounceClickDirective} from '../../directives/debounce-click.directive';
import {CalendarModule} from 'primeng/calendar';


@Component({
  selector: 'app-create-ctr-record',
  templateUrl: './create-ctr-record.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    NgIf,
    ProgressSpinnerModule,
    DebounceClickDirective,
    JsonPipe,
    CalendarModule
  ]
})
export class CreateCtrRecordComponent implements OnInit, OnChanges {

  @Input()
  eblID?: string;
  _eblID?: string;
  platformActionTimestamp: Date = new Date();
  action?: PlatformAction;
  actor?: string;
  receiver?: string;
  lastEnvelopeTransferChainEntrySignedContentChecksum?: string;
  canonicalRecord?: string;
  inResponseToRecord?: string;
  @Input()
  previousRecord?: string;

  eblIDFrozen: boolean = false;

  submissionInProgress: boolean = false;

  validityAssistance: boolean = true;
  parsedCtrRecords: ParsedCTRRecord[] = [];
  allActions: PlatformAction[] = [...PLATFORM_ACTIONS];

  @Output()
  created = new EventEmitter<ParsedCTRRecord>();

  constructor(private ctrService: CtrService,
              private router: Router,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private globals: Globals,
              ) {
  }

  get isCreateMode(): boolean {
    return !this.previousRecord;
  }

  get config(): Config {
    return this.globals.config!;
  }

  get record(): PlatformRecord {
    return {
      eblID: this._eblID ?? "<INVALID>",
      action: this.action ?? "INTEND TO TRANSFER",
      // UTC by virtue of p-calendar
      platformActionTimestamp: this.platformActionTimestamp.getTime(),
      actor: this.actor ?? "<INVALID>",
      receiver: this.receiver ?? undefined,
      lastEnvelopeTransferChainEntrySignedContentChecksum: this.lastEnvelopeTransferChainEntrySignedContentChecksum ?? undefined,
      previousRecord: this.previousRecord,
      inResponseToRecord: this.inResponseToRecord,
      canonicalRecord: this.canonicalRecord,
    }
  }

  get isContentValid(): boolean {
    return isValidEBLID(this._eblID);
  }

  clear(): void {
    this._eblID = this.eblID;
    this.actor = undefined;
    this.receiver = undefined;
    this.inResponseToRecord = undefined;
    this.canonicalRecord = undefined;
    this.previousRecord = undefined;
    this.lastEnvelopeTransferChainEntrySignedContentChecksum = undefined;
    this.platformActionTimestamp = new Date();
  }

  submit() {
    this.submissionInProgress = true;
    this.ctrService.postRecord(this.record)
      .pipe(first())
        .subscribe({
          next: async ref => {
            this.created.emit(ref);
            this.clear();
            this.submissionInProgress = false;
          }, error: error => {
            const errorMessage = ErrorMessageExtractor.getConcreteErrorMessage(error);
            this.submissionInProgress = false;
            this.messageService.add({
              key: 'GenericErrorToast',
              severity: 'error',
              summary: `Error while submitting new record to the CTR 😱`,
              detail: errorMessage
            });
          }
        });
  }

  cancel(): void {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to discard your changes?',
      accept: async () => {
        const eblID = this.eblID;
        const dest = !this.isCreateMode && eblID
          ? ['/records', eblID]
          : ['/'];
        await this.router.navigate(dest);
      }
    });
  }

  private onInitOrChange(): void {
    if (this.eblID) {
      this._eblID = this.eblID;
      this.eblIDFrozen = true;
    } else {
      this.eblIDFrozen = false;
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.onInitOrChange();
  }

  ngOnInit(): void {
    this.onInitOrChange();
  }
}
