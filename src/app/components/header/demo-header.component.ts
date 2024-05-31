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
import {PlatformState} from '../../models/dcsa-week-demo';
import {Platform} from '../../models/game-model';


@Component({
  styles: [
    '.dropdown-50p-width { width: 50% !important; min-width: 50% !important; overflow: visible}',
  ],
  selector: 'app-demo-header',
  templateUrl: './demo-header.component.html',
  styleUrl: './demo-header.component.scss',
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
export class DemoHeaderComponent {

  @Input()
  platforms: PlatformState[] = [];
  @Input()
  platform?: PlatformState
  @Output()
  platformChange = new EventEmitter<PlatformState>();


  constructor(private globals: Globals,
              ) {
  }

  get config(): Config {
    return this.globals.config!;
  }


  switchPlatform(platformState: PlatformState): void {
    this.platformChange.emit(platformState);
  }
}
