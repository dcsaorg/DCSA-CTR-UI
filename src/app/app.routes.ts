import {Routes} from '@angular/router';
import {StartPageComponent} from './components/start-page/start-page.component';
import {RenderCtrRecordsPageComponent} from './components/render-ctr-records-page/render-ctr-records-page.component';
import {TransactionGamePageComponent} from './components/transaction-game-page/transaction-game-page.component';

const guards: any[] = [];

export const routes: Routes = [
  {path: '', pathMatch: 'full', component: StartPageComponent},
  {path: 'records/:eblID', component: RenderCtrRecordsPageComponent},
  {path: 'transaction-game/:eblID', component: TransactionGamePageComponent},
];
