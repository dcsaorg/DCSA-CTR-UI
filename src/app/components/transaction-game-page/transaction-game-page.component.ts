import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, Observable, ReplaySubject} from 'rxjs';
import {TransactionGameComponent} from '../transaction-game/transaction-game.component';

@Component({
  selector: 'app-transaction-game-page',
  templateUrl: './transaction-game-page.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TransactionGameComponent
  ]
})
export class TransactionGamePageComponent implements OnInit {

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
