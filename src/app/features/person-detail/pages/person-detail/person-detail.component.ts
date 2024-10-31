import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PersonDetailService } from '../../services/person-detail.service';
import { PersonWithRelationsViewModel } from '../../models/models';
import { DialogService } from '@abraxas/base-components';
import {
  DialogData,
  HistorySearchType,
  HistorySelectorComponent,
} from '../../../common/components/history-selector/history-selector.component';
import {
  findTechnicalErrorMessage,
  getDateAsString,
  getDateFromUTCString,
  getValidFromAsUTCString,
  isUTCDateStringToday,
} from '../../../../core/utils/commons';
import { TranslateService } from '@ngx-translate/core';
import { concatTwoMaskedValues, valueOr } from '../../../../core/utils/types';
import { AppComponent } from '../../../../app.component';

@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss'],
})
export class PersonDetailComponent implements OnInit, OnDestroy {
  private readonly personId: string | null;
  private readonly evalDate: string | null;
  private subscription?: Subscription;
  public person?: PersonWithRelationsViewModel;
  public isLoading: boolean = false;
  public isActive: boolean = true;
  public hasLock: boolean = false;

  public headerLabel: string = '';

  public historySelector: DialogData | undefined;
  private selectedHistoryDate: Date = new Date();
  private selectedHistorySearchType: HistorySearchType = HistorySearchType.CURRENT_DATE;

  @Output()
  public afterClosed: EventEmitter<void> = new EventEmitter();


  constructor(
    private readonly route: ActivatedRoute,
    private readonly personDetailService: PersonDetailService,
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService) {

    this.personId = this.route.snapshot.paramMap.get('id');
    this.evalDate = this.route.snapshot.paramMap.get('evalDate');

    if (this.evalDate) {
      // Wir übernehmen das Datum aus der Suche
      if (isUTCDateStringToday(this.evalDate)) {
        this.selectedHistorySearchType = HistorySearchType.CURRENT_DATE;
      } else {
        this.selectedHistorySearchType = HistorySearchType.QUALIFYING_DATE;
      }
      this.selectedHistoryDate = getDateFromUTCString(this.evalDate);
    }

    this.historySelector = {
      selectedHistorySearchType: this.selectedHistorySearchType,
      selectedHistoryDate: this.selectedHistoryDate,
    };

  }

  ngOnInit(): void {
    this.loadPerson();
  }

  loadPerson(): void {

    this.isLoading = true;

    if (this.personId) {
      this.subscription = this.personDetailService
        .loadPersonWithDate(this.personId, getValidFromAsUTCString(this.selectedHistoryDate, this.selectedHistorySearchType))
        .subscribe({
          next: (it) => {
            this.person = it;
            this.isActive = it.personStatus === 0;
            this.hasLock = it.hasLock.type === 'Value' && (it.hasLock.value !== undefined && it.hasLock.value);
            // Es soll auf das korrekte Datum korrigiert werden, wenn die Person zu einem gewissen Stichtag
            // nicht ersichtlich ist.
            if (it.personEvalDate) this.selectedHistoryDate = getDateFromUTCString(it.personEvalDate);
            this.isLoading = false;
            this.setHeaderLabel(this.person);
          },
          error: (error) => {
            this.isLoading = false;
            throw findTechnicalErrorMessage(error);
          }
        })

    }
  }

  private setHeaderLabel(model: PersonWithRelationsViewModel) {

    let maskedName = concatTwoMaskedValues(model.person.nameData.officialName, model.person.nameData.firstName, ' ');
    this.headerLabel = valueOr(maskedName, ' - ') + ', ' + valueOr(model.person.birthData.dateOfBirth, ' - ');
  }

  formatPersonStatus(status: number | undefined): string {
    if (status === undefined) return '';
    switch (status) {
      case 0:
        return this.translate.instant('person-detail.personStatusTypes.active');
      case 1:
        return this.translate.instant('person-detail.personStatusTypes.moved_away');
      case 2:
        return this.translate.instant('person-detail.personStatusTypes.deceased');
      case 3:
        return this.translate.instant('person-detail.personStatusTypes.missing');
      default:
        return '';
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getHistoryLabel(): string {
    if (this.selectedHistorySearchType === HistorySearchType.CURRENT_DATE) {
      return this.translate.instant('general.upToDate');
    } else {
      return getDateAsString(this.selectedHistoryDate);
    }
  }

  personStatusTitle(): string {
    if (!this.isActive) {
      return this.translate.instant('person-detail.inactiveTitle').toUpperCase();
    }
    if (this.hasLock) {
      if (this.isBigOrMediumScreen()) {
        return this.translate.instant('person-detail.lockedTitle').toUpperCase();
      } else {
        return this.translate.instant('person-detail.lockedTitleShort').toUpperCase();
      }
    }
    return '';
  }

  personStatus(): 'active' | 'inactive' | 'locked' {
    if (!this.isActive) {
      return 'inactive';
    }
    if (this.hasLock) {
      return 'locked';
    }
    return 'active';
  }

  openHistorySelector() {

    let dialogRef = this.dialogService.open(HistorySelectorComponent, this.historySelector);
    dialogRef.afterClosed().subscribe(historySelectorResult => {
      if (historySelectorResult) {
        // Komme hierher wenn OK gedrückt
        this.historySelector = historySelectorResult;
        this.selectedHistoryDate = historySelectorResult.selectedHistoryDate;
        this.selectedHistorySearchType = historySelectorResult.selectedHistorySearchType;
        this.loadPerson();
      } else {
        // Komme ich hier her, wenn ich abbrechen gedrückt habe alte Werte können wieder reingestellt werden
        if (this.historySelector) {
          this.historySelector.selectedHistoryDate = this.selectedHistoryDate;
          this.historySelector.selectedHistorySearchType = this.selectedHistorySearchType;
        }
      }
      this.afterClosed.emit();
    });
  }

  isSmallOrMediumScreen() {
    return AppComponent.isSmallScreen || AppComponent.isMediumScreen;
  }

  isBigScreen() {
    return AppComponent.isBigScreen;
  }

  public isBigOrMediumScreen() {
    return AppComponent.isBigScreen || AppComponent.isMediumScreen;
  }

}
