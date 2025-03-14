import {AfterContentChecked, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { ButtonModule, DateModule, DialogModule, RadioButton, RadioButtonModule } from '@abraxas/base-components';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIf } from '@angular/common';

export interface DialogData {
  selectedHistorySearchType: string;
  selectedHistoryDate: Date;
}

export enum HistorySearchType {
  CURRENT_DATE = 'CURRENT_DATE',
  QUALIFYING_DATE = 'QUALIFYING_DATE'
}

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
    NgIf,
  ],
})

export class HistorySelectorComponent implements OnInit, AfterContentChecked {

  public historySelector: any | undefined;
  protected readonly HistorySearchType = HistorySearchType;

  public radiogroup: RadioButton[] = [
    {displayText: '', value: HistorySearchType.CURRENT_DATE, disabled: false},
    {displayText: '', value: HistorySearchType.QUALIFYING_DATE, disabled: false}
  ];


  constructor(
    private readonly translate: TranslateService,
    private readonly changeDetector: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    this.historySelector = data;
  }

  ngOnInit(): void {

    this.translate.get(['person-detail.historySearchTypes.currentDate', 'person-detail.historySearchTypes.qualifyingDate'])
      .subscribe(translations => {
        this.radiogroup[0].displayText = translations['person-detail.historySearchTypes.currentDate'];
        this.radiogroup[1].displayText = translations['person-detail.historySearchTypes.qualifyingDate'];
      });

  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }
}
