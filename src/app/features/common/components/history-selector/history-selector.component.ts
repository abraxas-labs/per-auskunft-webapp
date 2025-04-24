import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { ButtonModule, DateModule, DialogModule, RadioButton, RadioButtonModule } from '@abraxas/base-components';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  getEvalDateAsUTCString,
  getTodayAsUTCString, isUTCDateStringToday,
} from '../../../../core/utils/commons';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-history-selector',
  templateUrl: './history-selector.component.html',
  standalone: true,
  styleUrls: ['./history-selector.component.scss'],
  imports: [
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    DateModule,
    ButtonModule,
    MatDialogClose,
    ReactiveFormsModule,
  ],
})

export class HistorySelectorComponent {

  public form: FormGroup;

  public radioGroup: RadioButton[] = [
    {displayText: '', value: 'current', disabled: false},
    {displayText: '', value: 'otherDate', disabled: false}
  ];

  constructor(
    private readonly translate: TranslateService,
    private readonly dialogRef: MatDialogRef<HistorySelectorComponent>,
    private readonly formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public initialDate: Date) {

    this.radioGroup[0].displayText = this.translate.instant('person-detail.historySearchTypes.currentDate');
    this.radioGroup[1].displayText = this.translate.instant('person-detail.historySearchTypes.qualifyingDate');

    const initialDateAsString = getEvalDateAsUTCString(this.initialDate);
    const isInitialToday = isUTCDateStringToday(initialDateAsString);

    this.form = this.formBuilder.group({
      dateType: new FormControl(isInitialToday ? 'current' : 'otherDate'),
      selectedDate: new FormControl(
        {value: initialDateAsString, disabled: isInitialToday},
        { validators: Validators.required, updateOn: 'change' }
      ),
    }, {
      validators: this.validateForm
    });

    this.form.get('dateType')?.valueChanges.subscribe(value => {
      if (value === 'current') {
        this.form?.get('selectedDate')?.disable();
      } else {
        this.form?.get('selectedDate')?.enable();
      }
    });
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.dialogRef.close({
        selectedDate: this.form.value.dateType === 'current' ? new Date() : this.form.value.selectedDate
      });
    }
  }

  private validateForm(control: AbstractControl): ValidationErrors | null {
    const date = control.get('selectedDate')?.value;

    if (!date) {
      return {'dateCheck': 'no date selected'};
    }

    if (getTodayAsUTCString() < date) {
      return {'dateCheck': `date ${date} can not be in the future`}
    }

    return null;
  }
}
