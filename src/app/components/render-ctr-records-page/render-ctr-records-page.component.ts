import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, Observable, ReplaySubject} from 'rxjs';
import {RenderCtrRecordsComponent} from '../render-ctr-records/render-ctr-records.component';

@Component({
  selector: 'app-render-ctr-records-page',
  templateUrl: './render-ctr-records-page.component.html',
  standalone: true,
  imports: [
    RenderCtrRecordsComponent
  ]
})
export class RenderCtrRecordsPageComponent implements OnInit {

  eblID$: Observable<string> = new ReplaySubject();

  constructor(private route: ActivatedRoute,
              ) {
  }

  ngOnInit(): void {
    this.eblID$ = this.route.params.pipe(
      map(params => params['eblID']),
    )
  }

}
