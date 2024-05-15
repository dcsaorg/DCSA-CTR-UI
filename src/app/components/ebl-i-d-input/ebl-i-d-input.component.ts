import {ChangeDetectionStrategy, Component, HostListener, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {InputSwitchModule} from 'primeng/inputswitch';
import {NgIf} from '@angular/common';
import {InputTextareaModule} from 'primeng/inputtextarea';
import canonicalize from 'canonicalize';
import shajs from 'sha.js';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';

@Component({
  selector: 'app-ebl-i-d-input',
  templateUrl: './ebl-i-d-input.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    InputTextModule,
    InputSwitchModule,
    NgIf,
    InputTextareaModule,
    DialogModule,
    ButtonModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: EblIDInputComponent,
    },
  ]
})
export class EblIDInputComponent implements ControlValueAccessor {

  disabled = false;
  eblID: string = "";
  providedEBLID: string = "";
  ebl: string = "";
  eblBroken: boolean = false;
  inputType: boolean = false;

  eblDialogVisible = false;

  @Input()
  allowEBLInput = true;

  onTouched = () => {};
  onChange = (_v: string) => {}

  constructor() {
  }

  confirmEBL(): void {
   this.eblID = this.providedEBLID;
   this.onChange(this.eblID);
   this.onTouched();
   this.eblDialogVisible = false;
  }

  valueChanged(): void {
    this.onChange(this.eblID);
  }

  checksumEbl(): void {
    let canonical;
    try {
      canonical = canonicalize(JSON.parse(this.ebl));
      this.eblBroken = false;
    } catch (e) {
      this.eblBroken = true;
      return;
    }
    if (canonical === undefined) {
      this.eblBroken = true;
      return;
    }
    const sha256HashFunc = shajs('sha256');
    this.providedEBLID = sha256HashFunc.update(canonical).digest('hex');

  }

  writeValue(obj: string|null): void {
    if (obj === null) {
      return;
    }
    this.eblID = obj;
  }
  registerOnChange(fn: (v: string) => void): void {
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
