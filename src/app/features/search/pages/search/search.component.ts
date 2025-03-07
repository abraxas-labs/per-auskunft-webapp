import { Component } from '@angular/core';
import {
  SegmentedControl,
} from '@abraxas/base-components/lib/components/formfields/segmented-control-group/segmented-control.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PersonSearchService } from '../../services/person-search.service';
import { FullTextSearchAttributes, PersonSearchResult, SearchAttributes } from '../../models/models';
import { DialogData, HistorySearchType } from '../../../common/components/history-selector/history-selector.component';
import { findTechnicalErrorMessage, getValidFromAsUTCString } from '../../../../core/utils/commons';
import { PermissionService } from '../../../../core/services/permission.service';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { AppComponent } from '../../../../app.component';
import { OrganisationService } from '../../../../core/services/organisation.service';
import {
  AlertBarModule,
  CheckboxModule,
  DropdownModule,
  SegmentedControlGroupModule,
  SkeletonModule, SwitchModule,
} from '@abraxas/base-components';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ExtendedSearchMaskComponent } from '../../components/extended-search-mask/extended-search-mask.component';
import { SimpleSearchMaskComponent } from '../../components/simple-search-mask/simple-search-mask.component';
import { SearchResultTableComponent } from '../../components/search-result-table/search-result-table.component';
import { QueryParameterService } from '../../../../core/services/query-parameter.service';

export enum SearchOption {
  Simple,
  Extended,
}

export interface DropDownItems {
  displayValue: string;
  value: string;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    AlertBarModule,
    NgClass,
    SegmentedControlGroupModule,
    CheckboxModule,
    TranslateModule,
    DropdownModule,
    ExtendedSearchMaskComponent,
    SimpleSearchMaskComponent,
    SkeletonModule,
    AsyncPipe,
    SearchResultTableComponent,
    NgIf,
    SwitchModule,
  ],
})
export class SearchComponent {
  public searchOptions: SegmentedControl[];
  public affiliationOptions: DropDownItems[];
  public selectedAffiliationOption: string = 'Resident';
  public showExtendedSearchOptions: boolean = true;
  public isFormValid: boolean = false;
  public includeInactive = false;

  public results?: PersonSearchResult[];
  public isLoading: Observable<boolean>;
  public historySelector: DialogData | undefined;
  public withActivePersons = true;
  public showSearchDescription = true;
  private _isLoading = new BehaviorSubject<boolean>(false);
  private searchValue: any;
  private selectedHistoryDate: Date = new Date();
  private selectedHistorySearchType: HistorySearchType = HistorySearchType.CURRENT_DATE;
  public hasWarning: boolean = false;
  public warningMessage: string = '';

  constructor(
    private readonly translate: TranslateService,
    private readonly searchService: PersonSearchService,
    private readonly permissionService: PermissionService,
    private readonly organisationService: OrganisationService,
    private readonly queryParamService: QueryParameterService
  ) {
    this.searchOptions = [
      {
        displayText: this.translate.instant('search.options.simple'),
        value: SearchOption.Simple,
        disabled: false,
      },
      {
        displayText: this.translate.instant('search.options.extended'),
        value: SearchOption.Extended,
        disabled: false,
      },
    ];

    this.affiliationOptions = [
      {
        displayValue: translate.instant('search.options.affiliation-resident'),
        value: this.selectedAffiliationOption,
      },
    ];

    this.historySelector = {
      selectedHistorySearchType: this.selectedHistorySearchType,
      selectedHistoryDate: this.selectedHistoryDate,
    };

    this.permissionService.permission().subscribe({
      next: (it) => {
        this.withActivePersons = it.accessToInactiveResidents;
      },
    });

    this.isLoading = this._isLoading.pipe(debounceTime(500));
    this.organisationService.activeViewOrganisation().subscribe(() => this.clear());
  }

  searchOptionChanged($event: any) {
    this.showExtendedSearchOptions = !$event;
    this.clear();
  }

  valueUpdate($event: any) {
    this.searchValue = $event;
  }

  validUpdate($event: boolean) {
    this.isFormValid = $event;
  }

  searchAndUpdateActivity($event: boolean) {
    this.includeInactive = $event;
    this.search();
  }

  search() {
    if (this.isFormValid) {

      if (this.queryParamService.aViewOrganisationHasToBeChosen){
        this.handleWarning(this.translate.instant('search.header.noViewOrganisation'));
        return;
      }

      this.clear();
      this.showSearchDescription = false;
      if (this.showExtendedSearchOptions) {
        this.searchExtended();
      } else {
        this.searchSimple();
      }
    }
  }

  searchExtended() {
    const searchAttributes: SearchAttributes = {
      name: this.searchValue.name,
      firstName: this.searchValue.firstName,
      allianceName: this.searchValue.allianceName,
      dateOfBirth: this.searchValue.dateOfBirth,
      street: this.searchValue.street,
      houseNumber: this.searchValue.houseNumber,
      zipCode: this.searchValue.zipCode,
      town: this.searchValue.town,
      reportingMunicipalityCode: this.searchValue.reportingMunicipality,
      vn: this.searchValue.vn,
      id: this.searchValue.id,
      activeOnly: !this.includeInactive,
      evalDate: getValidFromAsUTCString(this.selectedHistoryDate, this.selectedHistorySearchType),
    };

    (Object.keys(searchAttributes) as (keyof typeof searchAttributes)[]).forEach((key) => {
      if (typeof searchAttributes[key] === 'string' && searchAttributes[key].length == 0) {
        searchAttributes[key] = undefined;
      }
    });

    this._isLoading.next(true);

    this.searchService
      .searchPerson(searchAttributes)
      .subscribe({
        next: (it) => {
          this.results = it.result?.items;
          it.errors?.forEach(warning => {
            this.handleWarning(warning);
          });
          this._isLoading.next(false);
        },
        error: (error) => {
          this._isLoading.next(false);
          throw findTechnicalErrorMessage(error);
        },
      });
  }

  searchSimple() {
    const fullTextSearchAttributes: FullTextSearchAttributes = {
      fullTextSearch: this.searchValue.simpleSearch.trim(),
      activeOnly: !this.includeInactive,
      evalDate: getValidFromAsUTCString(this.selectedHistoryDate, this.selectedHistorySearchType),
    };

    (Object.keys(fullTextSearchAttributes) as (keyof typeof fullTextSearchAttributes)[]).forEach((key) => {
      if (typeof fullTextSearchAttributes[key] === 'string' && fullTextSearchAttributes[key].length == 0) {
        fullTextSearchAttributes[key] = undefined;
      }
    });

    this._isLoading.next(true);

    this.searchService
      .fullTextSearchPerson(fullTextSearchAttributes)
      .subscribe({
        next: (it) => {
          this.results = it.result?.items;
          it.errors?.forEach(warning => {
            this.handleWarning(warning)
          });
          this._isLoading.next(false);
        },
        error: (error) => {
          this._isLoading.next(false);
          throw findTechnicalErrorMessage(error);
        },
      });
  }

  clear() {
    this.results = undefined;
    this.showSearchDescription = true;
    this.handleWarning('');
  }

  public isSmallScreen() {
    return AppComponent.isSmallScreen;
  }

  public isBigOrMediumScreen() {
    return AppComponent.isBigScreen || AppComponent.isMediumScreen;
  }

  private handleWarning(messageText: string){
    messageText.length > 0 ? this.hasWarning = true : this.hasWarning = false;
    this.warningMessage = messageText;
  }

}
