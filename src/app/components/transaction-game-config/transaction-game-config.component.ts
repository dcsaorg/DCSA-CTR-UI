import {Component, HostListener, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CtrService} from '../../services/ctr.service';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {TagModule} from 'primeng/tag';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {AsyncPipe, JsonPipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, SlicePipe} from '@angular/common';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {DebounceClickDirective} from '../../directives/debounce-click.directive';
import {CalendarModule} from 'primeng/calendar';
import {TableModule} from 'primeng/table';
import {CardModule} from 'primeng/card';
import {InputSwitchModule} from 'primeng/inputswitch';
import {GamePreferences, newGamePreferences} from '../../models/game-model';

@Component({
  selector: 'app-transaction-game-config',
  templateUrl: './transaction-game-config.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    TagModule,
    InputTextModule,
    ToastModule,
    NgIf,
    ProgressSpinnerModule,
    DebounceClickDirective,
    JsonPipe,
    CalendarModule,
    RouterLink,
    AsyncPipe,
    NgForOf,
    TableModule,
    NgSwitch,
    NgSwitchDefault,
    NgSwitchCase,
    SlicePipe,
    CardModule,
    InputSwitchModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TransactionGameConfigComponent,
    },
  ],
})
export class TransactionGameConfigComponent implements ControlValueAccessor {

  gamePreferences: GamePreferences = newGamePreferences();
  onTouched = () => {};
  onChange = (_v: GamePreferences) => {}
  disabled = false;

  changedHandler(): void {
    this.onChange(this.gamePreferences);
  }

  writeValue(obj: GamePreferences|null): void {
    if (obj === null) {
      return;
    }
    this.gamePreferences = obj;
  }

  registerOnChange(fn: (v: GamePreferences) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @HostListener("focusout")
  onFocusOut(): void {
    this.onTouched();
  }
}
