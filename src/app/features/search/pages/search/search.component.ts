import { Component } from '@angular/core';
import {
  SegmentedControl,
} from '@abraxas/base-components/lib/components/formfields/segmented-control-group/segmented-control.model';
import { TranslateService } from '@ngx-translate/core';
import { PersonSearchService } from '../../services/person-search.service';
import { FullTextSearchAttributes, PersonSearchResult, SearchAttributes } from '../../models/models';
import { DialogData, HistorySearchType } from '../../../common/components/history-selector/history-selector.component';
import { findTechnicalErrorMessage, getValidFromAsUTCString } from '../../../../core/utils/commons';
import { PermissionService } from '../../../../core/services/permission.service';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { AppComponent } from '../../../../app.component';
import { AlertBarService } from '@abraxas/base-components';

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
})
export class SearchComponent {
  public searchOptions: SegmentedControl[];
  public selectedSearchOption: SearchOption = SearchOption.Simple;
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

  constructor(
    private readonly translate: TranslateService,
    private readonly searchService: PersonSearchService,
    private readonly permissionService: PermissionService,
    private readonly alertService: AlertBarService
  ) {
    this.searchOptions = [
      {
        displayText: translate.instant('search.options.simple'),
        value: SearchOption.Simple,
        disabled: false,
      },
      {
        displayText: translate.instant('search.options.extended'),
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

    this.permissionService.loadPermission().subscribe({
      next: (it) => {
        this.withActivePersons = it.accessToInactiveResidents;
      },
    });

    this.isLoading = this._isLoading.pipe(debounceTime(500));
  }

  searchOptionChanged($event: any) {
    this.showExtendedSearchOptions = $event === SearchOption.Extended;
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
          it.errors?.forEach(err => this.alertService.warning(err));
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
          it.errors?.forEach(err => this.alertService.warning(err));
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
  }

  public isSmallScreen() {
    return AppComponent.isSmallScreen;
  }

  public isBigOrMediumScreen() {
    return AppComponent.isBigScreen || AppComponent.isMediumScreen;
  }


}
