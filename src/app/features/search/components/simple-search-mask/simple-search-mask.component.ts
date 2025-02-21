import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { atLeastTwoCharacterValidator, wildcardPositionValidator } from '../../../../core/utils/commons';
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
  private blockStartSearchEmit : boolean = false;

  constructor(private readonly formBuilder: FormBuilder) {
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

  /*
    Taste "Enter" löst "handleSearchButton" und "handleSearchField" in dieser Reihenfolge aus.
    Mittels "blockSearchEmit" unterdrücken wir den 2ten Event, damit nicht 2 Suchen abgesetzt werden.
    Etwas unschön, sollte eigentlich über event.preventDefault funktionieren.
   */
  handleSearchButton($event: PointerEvent) {
    this.blockStartSearchEmit = $event.pointerType != 'mouse';
    this.startSearch.emit();
  }

  handleSearchField() {
    if (this.blockStartSearchEmit) {
      this.blockStartSearchEmit = false;
    } else {
      this.startSearch.emit();
    }
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
