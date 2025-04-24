import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PersonDetailService } from '../../services/person-detail.service';
import { PersonWithRelationsViewModel } from '../../models/models';
import {
  ButtonModule,
  DialogService,
  ExpansionPanelModule,
  IconModule,
  SkeletonModule,
  StatusLabelModule,
} from '@abraxas/base-components';
import {
  HistorySelectorComponent,
} from '../../../common/components/history-selector/history-selector.component';
import {
  findTechnicalErrorMessage,
  getDateAsString,
  getDateFromUTCString,
  getEvalDateAsUTCString,
  isUTCDateStringToday,
} from '../../../../core/utils/commons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { concatTwoMaskedValues, valueOr } from '../../../../core/utils/types';
import { AppComponent } from '../../../../app.component';
import { MatToolbar } from '@angular/material/toolbar';
import { NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { ResidencesTableComponent } from '../../components/residences/residences-table.component';
import { FamilyTableComponent } from '../../components/family-table/family-table.component';
import { GuardianshipTableComponent } from '../../components/guardianship/guardianship-table.component';
import { HouseholdTableComponent } from '../../components/household-table/household-table.component';
import { PermissionService } from '../../../../core/services/permission.service';

@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss'],
  standalone: true,
  imports: [
    MatToolbar,
    NgClass,
    NgSwitch,
    IconModule,
    StatusLabelModule,
    ButtonModule,
    SkeletonModule,
    TranslateModule,
    SharedModule,
    ExpansionPanelModule,
    ResidencesTableComponent,
    FamilyTableComponent,
    GuardianshipTableComponent,
    HouseholdTableComponent,
    NgSwitchCase,
    NgIf,
    NgForOf,
  ],
})
export class PersonDetailComponent implements OnInit, OnDestroy {
  private readonly personId: string | null;
  private readonly evalDate: string | null;
  private subscription?: Subscription;
  public person?: PersonWithRelationsViewModel;
  public isLoading: boolean = false;
  public isActive: boolean = true;
  public lockValue: number = 0;
  public historyPermission: boolean = false;

  public headerLabel: string = '';

  private selectedHistoryDate: Date = new Date();

  @Output()
  public afterClosed: EventEmitter<void> = new EventEmitter();


  constructor(
    private readonly route: ActivatedRoute,
    private readonly personDetailService: PersonDetailService,
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService,
    private readonly permissionService: PermissionService) {

    this.personId = this.route.snapshot.paramMap.get('id');
    this.evalDate = this.route.snapshot.paramMap.get('evalDate');

    this.selectedHistoryDate = this.evalDate ? getDateFromUTCString(this.evalDate) : new Date();


    this.permissionService.permission().subscribe({
      next: (it) => {
        this.historyPermission = it.historicValues || it.fullHistoricPermission;
      },
    });

  }

  ngOnInit(): void {
    this.loadPerson();
  }

  loadPerson(): void {

    this.isLoading = true;

    if (this.personId) {
      this.subscription = this.personDetailService
        .loadPersonWithDate(this.personId, getEvalDateAsUTCString(this.selectedHistoryDate))
        .subscribe({
          next: (it) => {
            this.person = it;
            this.isActive = it.personStatus === 0;
            this.lockValue = (it.lockValue.type === 'Value' && it.lockValue.value !== undefined) ? it.lockValue.value : 0;
            // Es soll auf das korrekte Datum korrigiert werden, wenn die Person zu einem gewissen Stichtag
            // nicht ersichtlich ist.
            if (it.personEvalDate) this.selectedHistoryDate = getDateFromUTCString(it.personEvalDate);
            this.isLoading = false;
            this.setHeaderLabel(this.person);
          },
          error: (error) => {
            // We reset person and headerLabel, so we can be sure,
            // that in case of an error no old data is still shown to the user.
            this.person = undefined;
            this.headerLabel = '';
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
    if (isUTCDateStringToday(getEvalDateAsUTCString(this.selectedHistoryDate))) {
      return this.translate.instant('general.upToDate');
    } else {
      return getDateAsString(this.selectedHistoryDate);
    }
  }

  personStatusTitle(): string {
    if (!this.isActive) {
      return this.translate.instant('person-detail.inactiveTitle').toUpperCase();
    }
    if (this.lockValue === 1) {
      if (this.isBigOrMediumScreen()) {
        return this.translate.instant('person-detail.addressLockTitle').toUpperCase();
      } else {
        return this.translate.instant('person-detail.addressLockTitleShort').toUpperCase();
      }
    } else if (this.lockValue === 2) {
      if (this.isBigOrMediumScreen()) {
        return this.translate.instant('person-detail.dataLockTitle').toUpperCase();
      } else {
        return this.translate.instant('person-detail.dataLockTitleShort').toUpperCase();
      }
    }
    return '';
  }

  personStatus(): 'active' | 'inactive' | 'dataLock' | 'addressLock' {
    if (!this.isActive) {
      return 'inactive';
    }
    if (this.lockValue === 1) {
      return 'addressLock'
    } else if (this.lockValue === 2) {
      return 'dataLock'
    }
    return 'active';
  }

  openHistorySelector() {

    let dialogRef = this.dialogService.open(HistorySelectorComponent, this.selectedHistoryDate);
    dialogRef.afterClosed().subscribe(historySelectorResult => {
      if (historySelectorResult?.selectedDate) {
        // Komme hierher wenn OK gedrückt
        this.selectedHistoryDate = historySelectorResult.selectedDate;
        this.loadPerson();
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
