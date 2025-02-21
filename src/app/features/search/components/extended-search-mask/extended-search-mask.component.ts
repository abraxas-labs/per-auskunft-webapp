import { Component, EventEmitter, Output } from '@angular/core';
import { MaskOptions } from '@abraxas/base-components';
import {
  atLeastTwoCharacterValidator,
  wildcardPositionValidator,
} from '../../../../core/utils/commons';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { map, Observable } from 'rxjs';
import { OrganisationService, Organisation } from '../../../../core/services/organisation.service';
import { AppComponent } from '../../../../app.component';

@Component({
  selector: 'app-extended-search-mask',
  templateUrl: './extended-search-mask.component.html',
  styleUrls: ['./extended-search-mask.component.scss'],
})
export class ExtendedSearchMaskComponent {
  @Output()
  value = new EventEmitter<any>();

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

  public form: FormGroup;

  public visibleOrganisations: Observable<Organisation[]>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly customTenantService: OrganisationService
  ) {
    this.form = this.formBuilder.group(
      {
        name: new FormControl(null, [atLeastTwoCharacterValidator,wildcardPositionValidator]),
        firstName: new FormControl(null, [atLeastTwoCharacterValidator,wildcardPositionValidator]),
        allianceName: new FormControl(null, [atLeastTwoCharacterValidator,wildcardPositionValidator]),
        dateOfBirth: new FormControl(null, [this.noWildcardsValidator]),
        street: new FormControl(null, [atLeastTwoCharacterValidator,wildcardPositionValidator]),
        houseNumber: new FormControl(null, [wildcardPositionValidator]),
        zipCode: new FormControl(null, [atLeastTwoCharacterValidator,wildcardPositionValidator]),
        town: new FormControl(null, [atLeastTwoCharacterValidator,wildcardPositionValidator]),
        reportingMunicipality: new FormControl(null, [this.noWildcardsValidator]),
        vn: new FormControl(null, [
          Validators.minLength(13),
          Validators.maxLength(13),
          this.noWildcardsValidator,
        ]),
        id: new FormControl(null, [this.noWildcardsValidator]),
      },
      { validators: this.minimumFieldsValidator }
    );

    this.form.valueChanges.subscribe(() => {
      this.valid.emit(this.form.valid);
      this.value.emit(this.form.value);
    });
    this.visibleOrganisations = this.customTenantService
      .reportingMunicipalities()
      .pipe(map((arr) => arr.filter((it) => it.organisationTypeCode === '1')));
  }

  clearSearch() {
    this.form.reset();
    this.clear.emit();
  }

  private minimumFieldsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!!control.value.vn || !!control.value.id) {
      return null;
    }

    if (Object.keys(control.value).filter((key) => !!control.value[key]).length > 1) {
      return null;
    }
    return { message: 'Minimum Number of fields not reached' };
  };

  private noWildcardsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (typeof control.value !== 'string') {
      return null;
    }

    if (control.value?.includes('*') || control.value?.includes('?')) {
      return { message: 'No Wildcards allowed here' };
    }
    return null;
  };

  handleEnter($event: any) {
    $event.preventDefault();
    this.search();
  }

  public search() {
    this.startSearch.emit();
  }

  public isSmallOrMediumScreen() {
    return AppComponent.isSmallScreen || AppComponent.isMediumScreen;
  }

  public isBigScreen() {
    return AppComponent.isBigScreen;
  }
}
