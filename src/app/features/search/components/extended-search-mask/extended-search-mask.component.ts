import { Component, EventEmitter, Output } from '@angular/core';
import {
  ButtonModule,
  DateModule,
  DropdownModule,
  FilterModule,
  FilterOperationId,
  MaskedModule,
  MaskOptions,
  NumberModule,
  TextModule,
} from '@abraxas/base-components';
import {
  atLeastTwoCharacterValidator,
  notAllowedCharsValidator,
  noWildcardsValidator,
  onlyDigitsValidator,
  ValidationError,
} from '../../../../core/utils/commons';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { map, Observable } from 'rxjs';
import { Organisation, OrganisationService } from '../../../../core/services/organisation.service';
import { AppComponent } from '../../../../app.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { SearchElementDTO } from '../../models/models';
import { FilterOperation } from '@abraxas/base-components/lib/components/formfields/filter/filter.base';

export enum filterTypes {
  FILTER_TEXT = 'FILTER_TEXT',
  FILTER_NUMBER = 'FILTER_NUMBER',
  FILTER_VN = 'FILTER_VN',
  FILTER_DATE = 'FILTER_DATE',
  FILTER_LIST = 'FILTER_LIST'
}

export enum fieldNames {
  OFFICIAL_NAME = 'officialName',
  FIRST_NAME = 'firstName',
  ALLIANCE_NAME = 'allianceName',
  DATE_OF_BIRTH = 'dateOfBirth',
  STREET = 'street',
  HOUSE_NUMBER = 'houseNumber',
  ZIP_CODE = 'swissZipCode',
  TOWN = 'town',
  REPORTING_MUNICIPALITY = 'reportingMunicipality',
  VN = 'vn',
  ID = 'id'
}

export enum filterOperationId {
  ENDS_WITH = 'ends_with',
  STARTS_WITH = 'starts_with',
  LESS_EQUAL = 'less_equal',
  GREATER_EQUAL = 'greater_equal',
  ALL_OF = 'all_of',
}

export enum filterOperationIcon {
  ENDS_WITH = 'ends-with',
  STARTS_WITH = 'starts-with',
  LESS_EQUAL = 'less-equal',
  GREATER_EQUAL = 'greater-equal'
}

@Component({
  selector: 'app-extended-search-mask',
  templateUrl: './extended-search-mask.component.html',
  styleUrls: ['./extended-search-mask.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    TextModule,
    DateModule,
    ButtonModule,
    NumberModule,
    DropdownModule,
    AsyncPipe,
    MaskedModule,
    NgIf,
    FilterModule,
  ],
})
export class ExtendedSearchMaskComponent {

  @Output()
  valueExtended = new EventEmitter<any>();

  @Output()
  valid = new EventEmitter<boolean>();

  @Output()
  startSearch = new EventEmitter<void>();

  @Output()
  clear = new EventEmitter<void>();

  public vnMask: MaskOptions = {
    mask: '000.0000.0000.00',
    shownMaskExpression: '___.____.____.__',
    showMaskTyped: true,
  } as MaskOptions;

  public MAX_LENGTH_4: number = 4;
  public MAX_LENGTH_12: number = 12;
  public MAX_LENGTH_13: number = 13;
  public MAX_LENGTH_50: number = 50;
  public MAX_LENGTH_150: number = 150;

  protected readonly fieldNames = fieldNames;
  protected readonly filterTypes = filterTypes;
  protected readonly FilterOperationId = FilterOperationId;

  public filterOperationsDate: FilterOperation[] = [];
  public filterOperationsTextOrNumber: FilterOperation[] = [];

  public form: FormGroup;
  public visibleOrganisations: Observable<Organisation[]>;
  public searchElements: SearchElementDTO[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly customTenantService: OrganisationService,
    private readonly translate: TranslateService,
  ) {
    this.form = this.formBuilder.group(
      {
        officialName: new FormControl(null, [atLeastTwoCharacterValidator, notAllowedCharsValidator, noWildcardsValidator]),
        firstName: new FormControl(null, [atLeastTwoCharacterValidator, notAllowedCharsValidator, noWildcardsValidator]),
        allianceName: new FormControl(null, [atLeastTwoCharacterValidator, notAllowedCharsValidator, noWildcardsValidator]),
        dateOfBirth: new FormControl(null, [notAllowedCharsValidator]),
        street: new FormControl(null, [atLeastTwoCharacterValidator, notAllowedCharsValidator, noWildcardsValidator]),
        houseNumber: new FormControl(null, []),
        swissZipCode: new FormControl(null, []),
        town: new FormControl(null, [atLeastTwoCharacterValidator, notAllowedCharsValidator, noWildcardsValidator]),
        reportingMunicipality: new FormControl(null, [noWildcardsValidator]),
        vn: new FormControl(null, [
          Validators.minLength(this.MAX_LENGTH_13),
          Validators.maxLength(this.MAX_LENGTH_13),
          notAllowedCharsValidator]),
        id: new FormControl(null, [noWildcardsValidator, notAllowedCharsValidator]),
      },
      { validators: this.minimumFieldsValidator },
    );

    this.form.valueChanges.subscribe(() => {
      this.valid.emit(this.form.valid);
    });

    this.visibleOrganisations = this.customTenantService
      .reportingMunicipalities().pipe(
        map((arr) => arr.filter((it) => it.organisationTypeCode === '1')),
        map(res => res.sort((a, b) => {
          return a.organisationName.localeCompare(b.organisationName);
        })),
      );

    this.initFilterOperations();
  }

  initFilterOperations() {
    this.initFilterOperationsDate();
    this.initFilterOperationsText();
  }

  initFilterOperationsDate() {
    const filterEquals: FilterOperation = {
      id: FilterOperationId.EQUALS,
      label: this.translate.instant('search.operations.' + FilterOperationId.EQUALS),
      icon: FilterOperationId.EQUALS,
    };
    const filterLess: FilterOperation = {
      id: FilterOperationId.LESS_EQUAL,
      label: this.translate.instant('search.operations.' + FilterOperationId.LESS_EQUAL),
      icon: filterOperationIcon.LESS_EQUAL,
    };
    const filterGreater: FilterOperation = {
      id: FilterOperationId.GREATER_EQUAL,
      label: this.translate.instant('search.operations.' + FilterOperationId.GREATER_EQUAL),
      icon: filterOperationIcon.GREATER_EQUAL,
    };
    const filterBetween: FilterOperation = {
      id: FilterOperationId.BETWEEN,
      label: this.translate.instant('search.operations.' + FilterOperationId.BETWEEN),
      icon: FilterOperationId.BETWEEN,
    };

    this.filterOperationsDate.push(filterLess);
    this.filterOperationsDate.push(filterEquals);
    this.filterOperationsDate.push(filterGreater);
    this.filterOperationsDate.push(filterBetween);
  }

  initFilterOperationsText() {

    const filterContains: FilterOperation = {
      id: FilterOperationId.CONTAINS,
      label: this.translate.instant('search.operations.' + FilterOperationId.CONTAINS),
      icon: FilterOperationId.CONTAINS,
    };
    const filterEquals: FilterOperation = {
      id: FilterOperationId.EQUALS,
      label: this.translate.instant('search.operations.' + FilterOperationId.EQUALS),
      icon: FilterOperationId.EQUALS,
    };
    const filterStartsWith: FilterOperation = {
      id: FilterOperationId.STARTS_WITH,
      label: this.translate.instant('search.operations.' + FilterOperationId.STARTS_WITH),
      icon: filterOperationIcon.STARTS_WITH,
    };
    const filterEndsWith: FilterOperation = {
      id: FilterOperationId.ENDS_WITH,
      label: this.translate.instant('search.operations.' + FilterOperationId.ENDS_WITH),
      icon: filterOperationIcon.ENDS_WITH,
    };
    this.filterOperationsTextOrNumber.push(filterContains);
    this.filterOperationsTextOrNumber.push(filterEquals);
    this.filterOperationsTextOrNumber.push(filterStartsWith);
    this.filterOperationsTextOrNumber.push(filterEndsWith);
  }

  clearSearch() {
    this.form.reset();
    this.clear.emit();
  }

  disableSearchButton() {

    let enabled = this.form.valid;
    if (enabled) {
      enabled = enabled && this.searchElements.length >= this.minFields();
    }
    return !enabled;
  }

  private minFields() {
    return this.form?.controls['reportingMunicipality'].value ? 2 : 1;
  }

  private minimumFieldsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (Object.keys(control.value).filter((key) => !!control.value[key]).length >= this.minFields()) {
      return null;
    }
    return { message: 'Minimum Number of fields not reached' };
  };

  private zipCodeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (typeof control.value !== 'string') {
      return null;
    }
    const notAllowed = notAllowedCharsValidator(control);
    if (notAllowed) return notAllowed;
    const onlyDigits = onlyDigitsValidator(control);
    if (onlyDigits) return onlyDigits;

    const index = this.searchElements.findIndex((e) => e.searchField === fieldNames.ZIP_CODE);
    if (index >= 0) {
      const operator = this.searchElements[index].operator;
      const numValue: number = +control.value;
      const numLength = control.value.length;
      if (operator == FilterOperationId.EQUALS || numLength == 4) {
        if (numValue < 1000 || numValue > 9699) {
          return { message: 'Range allowed 1000-9699', errorCode: 'zipCodeRange' } as ValidationError;
        }
      }
      if (operator == filterOperationId.STARTS_WITH){
        if ((numLength == 1 && numValue < 1) || (numLength == 2 && numValue < 10) || (numLength == 3 && numValue < 100)){
          return { message: 'Range allowed 1000-9699', errorCode: 'zipCodeRange' } as ValidationError;
        }
      }
    }
    return null;
  };

  private houseNrValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (typeof control.value !== 'string') {
      return null;
    }
    const notAllowed = notAllowedCharsValidator(control);
    if (notAllowed) return notAllowed;
    const onlyDigits = onlyDigitsValidator(control);
    if (onlyDigits) return onlyDigits;

    const index = this.searchElements.findIndex((e) => e.searchField === fieldNames.HOUSE_NUMBER);
    if (index >= 0) {
      const operator = this.searchElements[index].operator;
      const numValue: number = +control.value;
      if (operator == FilterOperationId.EQUALS || operator == filterOperationId.STARTS_WITH) {
        if (numValue < 1) {
          return { message: 'Range allowed 1-999999999999', errorCode: 'houseNrRange' } as ValidationError;
        }
      }
    }
    return null;
  };

  handleEnter($event: any) {
    $event.preventDefault();
    this.search();
  }

  public search() {
    this.valueExtended.emit(this.searchElements);
    this.startSearch.emit();
  }

  filterChanged($event: any, fieldName: string, filterType: string) {
    if (!$event) return;
    this.updateSearchElementDTO($event.value, $event.operation, fieldName, filterType);

    if (fieldName == fieldNames.ZIP_CODE) {
      this.form?.controls[fieldNames.ZIP_CODE].setErrors(this.zipCodeValidator(this.form?.controls[fieldNames.ZIP_CODE]));
    }
    if (fieldName == fieldNames.HOUSE_NUMBER) {
      this.form?.controls[fieldNames.HOUSE_NUMBER].setErrors(this.houseNrValidator(this.form?.controls[fieldNames.HOUSE_NUMBER]));
    }
  }

  filterVNChanged($event: any, fieldName: string, filterType: string) {
    const value = this.form?.controls[fieldName]?.value;
    this.updateSearchElementDTO(value, FilterOperationId.EQUALS, fieldName, filterType);
  }

  filterMunicipalityChanged($event: any, fieldName: string, filterType: string) {
    this.updateSearchElementDTO($event, FilterOperationId.CONTAINS, fieldName, filterType);
  }

  updateSearchElementDTO(eventValue: any, eventOperation: any, elementName: string, filterType: string) {

    const operationsValues: string[] = [];
    if (eventValue != null) {
      if (filterType == filterTypes.FILTER_DATE) {
        operationsValues.push(eventValue.value);
        if (eventValue.until) {
          operationsValues.push(eventValue.until);
        }
      } else {
        operationsValues.push(eventValue);
      }
    }

    const searchElementDTO: SearchElementDTO = {
      searchField: elementName,
      operator: this.mapEventOperations(eventOperation, filterType),
      values: operationsValues,
    };

    const index = this.searchElements.findIndex((e) => e.searchField === elementName);
    if (index >= 0) {
      if (operationsValues[0] == null || operationsValues[0] == '') {
        this.searchElements.splice(index, 1);
        return;
      }
    }
    if (index === -1) {
      if (operationsValues[0] == null || operationsValues[0] == '') {
        return;
      } else {
        this.searchElements.push(searchElementDTO);
      }
    } else {
      this.searchElements[index] = searchElementDTO;
    }
  }

  mapEventOperations(eventOperation: any, filterType: any) {
    if (eventOperation == FilterOperationId.STARTS_WITH) {
      return filterOperationId.STARTS_WITH;
    }
    if (eventOperation == FilterOperationId.ENDS_WITH) {
      return filterOperationId.ENDS_WITH;
    }
    if (eventOperation == FilterOperationId.LESS_EQUAL) {
      return filterOperationId.LESS_EQUAL;
    }
    if (eventOperation == FilterOperationId.GREATER_EQUAL) {
      return filterOperationId.GREATER_EQUAL;
    }
    if (filterType == filterTypes.FILTER_LIST && eventOperation == FilterOperationId.CONTAINS) {
      return filterOperationId.ALL_OF;
    }
    return eventOperation;
  }

  showValidationError(fieldName: string) {
    if (this.form?.controls[fieldName]?.errors?.['errorCode'] && this.form?.controls[fieldName]?.dirty) {
      return this.translate.instant('search.extendedSearchValidation.' + this.form?.controls[fieldName]?.errors?.['errorCode']);
    }
    return '\u2000';
  }

  public isSmallOrMediumScreen() {
    return AppComponent.isSmallScreen || AppComponent.isMediumScreen;
  }

  public isBigScreen() {
    return AppComponent.isBigScreen;
  }
}
