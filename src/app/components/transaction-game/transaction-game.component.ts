import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject, map, Observable, ReplaySubject, switchMap, tap} from 'rxjs';
import {RenderCtrRecordsComponent} from '../render-ctr-records/render-ctr-records.component';
import {TabViewChangeEvent, TabViewModule} from 'primeng/tabview';
import {
  CTRGame,
  CTRTab,
  GamePreferences,
  GameTab,
  newGamePreferences,
  PintTransfer, PintTransferTab,
  PlatformTab
} from '../../models/game-model';
import {CtrService} from '../../services/ctr.service';
import {Globals} from '../../models/globals';
import {
  AsyncPipe,
  JsonPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  SlicePipe
} from '@angular/common';
import {TagModule} from 'primeng/tag';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {BadgeModule} from 'primeng/badge';
import {CtrRecordTableComponent} from '../ctr-record-table/ctr-record-table.component';
import {CardModule} from 'primeng/card';
import {InputSwitchModule} from 'primeng/inputswitch';
import {FormsModule} from '@angular/forms';
import {TransactionGameConfigComponent} from '../transaction-game-config/transaction-game-config.component';
import {isValidEBLID, ParsedCTRRecord} from '../../models/records';
import {CreateCtrRecordComponent} from '../create-ctr-record/create-ctr-record.component';
import {CreatePintTransferComponent} from '../create-pint-transfer/create-pint-transfer.component';
import {TableModule} from 'primeng/table';
import {AccordionModule} from 'primeng/accordion';
import {RenderPintTransfersComponent} from '../render-pint-transfers/render-pint-transfers.component';
import {ToastModule} from 'primeng/toast';
import {ConfirmationService, MessageService} from 'primeng/api';

@Component({
  selector: 'app-transaction-game',
  templateUrl: './transaction-game.component.html',
  styles: '.dirty-tab { color:red }',
  standalone: true,
  imports: [
    RenderCtrRecordsComponent,
    TabViewModule,
    AsyncPipe,
    NgIf,
    TagModule,
    ProgressSpinnerModule,
    NgForOf,
    NgSwitchCase,
    SlicePipe,
    NgSwitch,
    NgSwitchDefault,
    BadgeModule,
    CtrRecordTableComponent,
    JsonPipe,
    CardModule,
    InputSwitchModule,
    FormsModule,
    TransactionGameConfigComponent,
    CreateCtrRecordComponent,
    NgClass,
    CreatePintTransferComponent,
    TableModule,
    AccordionModule,
    RenderPintTransfersComponent,
    ToastModule
  ]
})
export class TransactionGameComponent implements OnInit, OnChanges {

  @Input()
  eblID$: Observable<string> = new ReplaySubject<string>();
  game$: Observable<CTRGame> = new ReplaySubject<CTRGame>();
  activeIndex: number = 0;
  gamePreferences: GamePreferences = newGamePreferences();
  refresh$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  constructor(private ctrService: CtrService,
              private messageService: MessageService,
              private globals: Globals,
              ) {
  }

  ngOnInit(): void {
    this.startPipeline();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.startPipeline();
  }

  eblIDHasValidForm(eblID: string): boolean {
    return isValidEBLID(eblID);
  }

  isKnownEblID(eblID: string): boolean {
    return this.ctrService.hasEbl(eblID);
  }

  asPlatformTab(tab: GameTab): PlatformTab|null {
    if (tab.tabType === 'platform') {
      return tab as PlatformTab;
    }
    return null;
  }

  asCtrTab(tab: GameTab): CTRTab|null {
    if (tab.tabType === 'ctr') {
      return tab as CTRTab;
    }
    return null;
  }

  asPintTransferTab(tab: GameTab): PintTransferTab|null {
    if (tab.tabType === 'pint') {
      return tab as PintTransferTab;
    }
    return null;
  }

  private startPipeline(): void {
    const eblID$ = this.eblID$;
    this.game$ = eblID$.pipe(
      switchMap(eblID => {
        const game = new CTRGame(eblID, this.globals.config!);
        this.activeIndex = -1;
        this._filterTabs(game, -1);
        return this.ctrService.ctrRecordStream$(eblID).pipe(
          map(records => {
            game.updateState(records);
            return game;
          }),
          tap(_ => this.refresh(game)),
        );
      }),
    )
  }

  preferenceChange(game: CTRGame): void {
    this._filterTabs(game, this.activeIndex);
  }

  _filterTabs(game: CTRGame, currentVisibleIndex: number): void {
    const tab: GameTab|null = currentVisibleIndex >= 0 ? game.shownTabs[currentVisibleIndex] : null;
    for (const tab of game.tabs) {
      tab.isActive = false;
    }

    if (this.gamePreferences.alwaysShowAllTabs) {
      game.shownTabs = game.tabs;
    } else {
      game.shownTabs = game.tabs.filter(v => !v.tabCanBeOmitted);
    }

    if (tab !== null) {
      currentVisibleIndex = game.shownTabs.findIndex(v => v === tab) ?? -1;
    }
    if (currentVisibleIndex < 0) {
      this.activeIndex = game.shownTabs.findIndex(v => !v.disabled) ?? 0;
    } else {
      this.activeIndex = currentVisibleIndex;
    }
    game.shownTabs[this.activeIndex].isActive = true;
  }


  refresh(game: CTRGame): void {
    this._filterTabs(game, this.activeIndex);
    this.refresh$.next(1);
  }

  onTabChange(game: CTRGame, newIndex: number): void {
    if (this.activeIndex === newIndex) {
      return;
    }

    game.shownTabs[this.activeIndex].isActive = false;
    this.activeIndex = newIndex;
    game.shownTabs[newIndex].isActive = true;
  }

  pintTransferInitiated(game: CTRGame, $event: PintTransfer): void {
    game.pintTransferInitiated($event);
    this._filterTabs(game, this.activeIndex);
  }

  pintTransferAnswered(game: CTRGame, transfer: PintTransfer): void {
    game.pintTransferAnswered(transfer);
    this.messageService.add({
      key: 'GenericSuccessToast',
      severity: 'success',
      summary: `PINT Transfer answered`,
      detail: `The PINT transfer ${transfer.transferID + 1} got the answer ${transfer.answer}`,
    });
  }
}
