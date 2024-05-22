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
import {EblIDInputComponent} from '../ebl-i-d-input/ebl-i-d-input.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {PintTransfer} from '../../models/game-model';


@Component({
  selector: 'app-create-pint-transfer',
  templateUrl: './create-pint-transfer.component.html',
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
    CalendarModule,
    EblIDInputComponent,
    OverlayPanelModule,
  ]
})
export class CreatePintTransferComponent {

  sender?: string;
  receiver?: string;

  @Input()
  allowedActors: string[] | null = null;

  submissionInProgress: boolean = false;

  @Output()
  created = new EventEmitter<PintTransfer>();
  @Input()
  transferID: number = -1;

  constructor(private globals: Globals,
              ) {
  }

  get config(): Config {
    return this.globals.config!;
  }

  get actors(): string[] {
    const actors = this.allowedActors;
    if (actors === null) {
      return this.config.platforms;
    }
    return actors;
  }

  get isContentValid(): boolean {
    return this.sender !== undefined && this.receiver !== undefined;
  }

  clear(): void {
    this.sender = undefined;
    this.receiver = undefined;
  }

  submit(): void {
    this.submissionInProgress = true;
    this.created.emit(new PintTransfer(
      this.transferID!,
      this.sender!,
      this.receiver!,
    ))
    this.submissionInProgress = false;
  }

}
