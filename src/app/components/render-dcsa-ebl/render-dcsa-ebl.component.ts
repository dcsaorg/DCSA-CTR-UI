import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {JsonPipe, NgIf} from '@angular/common';
import {EBL} from '../../models/dcsa-week-demo';
import {CardModule} from 'primeng/card';
import {InputTextModule} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {TagModule} from 'primeng/tag';
import {FloatLabelModule} from 'primeng/floatlabel';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ButtonModule} from 'primeng/button';
import {DebounceClickDirective} from '../../directives/debounce-click.directive';
import {DialogModule} from 'primeng/dialog';

@Component({
  selector: 'app-render-dcsa-ebl',
  templateUrl: './render-dcsa-ebl.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    JsonPipe,
    CardModule,
    InputTextModule,
    FormsModule,
    ProgressSpinnerModule,
    TagModule,
    NgIf,
    FloatLabelModule,
    OverlayPanelModule,
    ButtonModule,
    DebounceClickDirective,
    DialogModule,
  ]
})
export class RenderDcsaEblComponent {

  @Input()
  ebl: EBL|null = null;

  rawVisible: boolean = false;

}
