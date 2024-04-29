import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {NgIf} from '@angular/common';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ButtonModule} from 'primeng/button';

@Component({
  selector: 'app-goto-ebl',
  templateUrl: './goto-ebl.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    InputTextModule,
    NgIf,
    ProgressSpinnerModule,
    RouterLink,
    ButtonModule,
  ]
})
export class GotoEblComponent {

  eblID?: string;
  submissionInProgress: boolean = false;

  constructor() {}
}
