import {Component} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {NgIf} from '@angular/common';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ButtonModule} from 'primeng/button';
import {CreateCtrRecordComponent} from '../create-ctr-record/create-ctr-record.component';
import {GotoEblComponent} from '../goto-ebl/goto-ebl.component';
import {ParsedCTRRecord} from '../../models/records';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DropdownModule,
    InputTextModule,
    NgIf,
    ProgressSpinnerModule,
    RouterLink,
    ButtonModule,
    CreateCtrRecordComponent,
    GotoEblComponent,
  ]
})
export class StartPageComponent {
  constructor(private router: Router,
              ) {}

  async onCreated(record: ParsedCTRRecord) {
    await this.router.navigate(['/records', record.parsedPlatformRecord.eblID])
  }
}
