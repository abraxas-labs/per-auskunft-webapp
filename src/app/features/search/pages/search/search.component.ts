import { Component } from '@angular/core';
import {
  SegmentedControl,
} from '@abraxas/base-components/lib/components/formfields/segmented-control-group/segmented-control.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PersonSearchService } from '../../services/person-search.service';
import { ExtendedSearchDTO, FullTextSearchAttributes, PersonSearchResult } from '../../models/models';
import {
  findTechnicalErrorMessage,
  getTodayAsUTCString,
} from '../../../../core/utils/commons';
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
  public withActivePersons = true;
  private _isLoading = new BehaviorSubject<boolean>(false);
  private searchValue: any;
  private searchElements: any;
  public hasWarning: boolean = false;
  public warningMessage: string = '';
  private readonly defaultEvalDate = getTodayAsUTCString();

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

  valueUpdateExtended($event: any){
    this.searchElements = $event;
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

      if (this.showWarningNoViewOrganisationChosen()){
        this.handleWarning(this.translate.instant('search.header.noViewOrganisation'));
        return;
      }

      this.clear();
      if (this.showExtendedSearchOptions) {
        this.searchExtended();
      } else {
        this.searchSimple();
      }
    }
  }

  showWarningNoViewOrganisationChosen(){
    return !this.queryParamService.activeViewOrganisationId && this.organisationService.viewOrganisationsCount() > 0;
  }

  searchExtended() {

    const extendedSearchDTO: ExtendedSearchDTO = {
      elements: this.searchElements,
      activeOnly: !this.includeInactive,
      evalDate: this.defaultEvalDate,
    }

    this._isLoading.next(true);

    this.searchService
      .searchPersonExtended(extendedSearchDTO)
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
      evalDate: this.defaultEvalDate,
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
