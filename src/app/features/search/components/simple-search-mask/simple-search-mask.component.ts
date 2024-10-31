import { Component, EventEmitter, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  atLeastTwoCharacterValidator, wildcardPositionValidator,
} from '../../../../core/utils/commons';
import { map, Observable } from 'rxjs';
import { CustomTenantService, Organisation } from '../../../../core/services/custom-tenant.service';
import { AppComponent } from '../../../../app.component';

@Component({
  selector: 'app-simple-search-mask',
  templateUrl: './simple-search-mask.component.html',
  styleUrls: ['./simple-search-mask.component.scss'],
})
export class SimpleSearchMaskComponent {
  @Output()
  value = new EventEmitter<any>();

  @Output()
  valid = new EventEmitter<boolean>();

  @Output()
  startSearch = new EventEmitter<void>();

  @Output()
  clear = new EventEmitter<void>();

  public form: FormGroup;

  public visibleOrganisations: Observable<Organisation[]>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly customTenantService: CustomTenantService
  ) {
    this.form = this.formBuilder.group({
      simpleSearch: new FormControl(null, [this.simpleSearchValidator]),
    });

    this.form.valueChanges.subscribe(() => {
      this.valid.emit(this.form.valid);
      this.value.emit(this.form.value);
    });

    this.customTenantService.loadVisibleOrgansiations();
    this.visibleOrganisations = this.customTenantService
      .visibleOrganisations()
      .pipe(map((arr) => arr.filter((it) => it.organisationTypeCode === '1')));
  }

  clearSearch() {
    this.form.reset();
    this.valid.emit(false);
    this.clear.emit();
  }

  handleEnter($event: any) {
    $event.preventDefault();
    this.searchEmit();
  }

  handleSearch() {
    this.searchEmit();
  }

  searchEmit() {
    this.startSearch.emit();
  }

  private simpleSearchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (!control.value) {
      return { message: 'The searchField may not be empty' };
    }

    let validationResult = atLeastTwoCharacterValidator(control);
    if (validationResult != null) {
      return validationResult;
    }

    validationResult = wildcardPositionValidator(control);
    if (validationResult != null) {
      return validationResult;
    }

    // Keine Wildcards für numerische Werte
    return this.noWildcardsValidator(control);
  };

  private noWildcardsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    for (let item of control.value?.split(' ')) {
      // Wenn Ziffer in Suchterm vorkommt, dürfen keine Wildcards drin sein.
      // Beispiele für ungültige Werte:
      // 1965-05-?6
      // 756.23*.234.2342
      // 13?
      if (item.match(/\d+/g) && (item.includes('*') || item.includes('?'))) {
        return { message: 'No Wildcards allowed here' };
      }
    }

    return null;
  };

  public isSmallScreen() {
    return AppComponent.isSmallScreen;
  }

  public isBigOrMediumScreen() {
    return AppComponent.isBigScreen || AppComponent.isMediumScreen;
  }

}
