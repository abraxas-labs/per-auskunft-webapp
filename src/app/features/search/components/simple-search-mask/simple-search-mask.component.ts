import { Component, EventEmitter, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  atLeastTwoCharacterValidator,
  notAllowedCharsValidator,
  ValidationError,
} from '../../../../core/utils/commons';
import { AppComponent } from '../../../../app.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { ButtonModule, SearchModule } from '@abraxas/base-components';

@Component({
  selector: 'app-simple-search-mask',
  templateUrl: './simple-search-mask.component.html',
  styleUrls: ['./simple-search-mask.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    NgClass,
    SearchModule,
    ButtonModule,
  ],
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

  constructor(private readonly formBuilder: FormBuilder,
              private readonly translate: TranslateService) {

    this.form = this.formBuilder.group({
      simpleSearch: new FormControl(null, [this.simpleSearchValidator]),
    });

    this.form.valueChanges.subscribe(() => {
      this.valid.emit(this.form.valid);
      this.value.emit(this.form.value);
    });
  }

  clearSearch() {
    this.form.reset();
    this.valid.emit(false);
    this.clear.emit();
  }

  handleSearchField() {
    this.startSearch.emit();
  }

  private simpleSearchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (!control.value) {
      return {
        message: 'The searchField may not be empty',
        errorCode: 'noEmptySearchField',
      } as ValidationError;
    }

    let validationResult = atLeastTwoCharacterValidator(control);
    if (validationResult != null) {
      return validationResult;
    }
    return notAllowedCharsValidator(control);
  };

  showValidationError() {
    const errorControl = 'simpleSearch';
    if (this.form?.controls[errorControl]?.errors?.['errorCode'] && this.form?.controls[errorControl]?.dirty) {
      return this.translate.instant('search.validation.' + this.form?.controls[errorControl]?.errors?.['errorCode']);
    }
    return '';
  }

  public isSmallScreenOrMediumScreen() {
    return AppComponent.isSmallScreen || AppComponent.isMediumScreen;
  }

  public isBigScreen() {
    return AppComponent.isBigScreen;
  }

}
