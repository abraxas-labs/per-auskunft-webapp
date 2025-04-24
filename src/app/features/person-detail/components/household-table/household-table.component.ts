import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  ButtonModule,
  IconModule,
  SortDirective,
  StatusLabelModule,
  TableDataSource,
  TableModule,
} from '@abraxas/base-components';
import { CustomRoutingService } from '../../../../shared/services/custom-routing.service';
import { MaskedPipe } from '../../../../shared/pipes/masked.pipe';
import { HouseholdMember } from '../../models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { dataLockToIcon, sexCodeToIcon } from '../../../../core/utils/commons';
import { DatePipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { TableColumn } from '../../../search/components/search-result-table/search-result-table.component';

export interface Column {
  title: string;
  expression: string;
}

export enum TableColumnIds {
  DATA_LOCK_ICON = 'dataLockIcon',
  SEX_CODE = 'sexCode',
  OFFICIAL_NAME = 'officialName',
  FIRST_NAME = 'firstName',
  DATE_OF_BIRTH = 'dateOfBirth',
  EG_ID = 'egId',
  EW_ID = 'ewId',
  RESIDENCE_TYPE = 'residenceType'
}

@Component({
  selector: 'app-household-table',
  templateUrl: './household-table.component.html',
  styleUrls: ['./household-table.component.scss'],
  standalone: true,
  imports: [
    TableModule,
    NgSwitch,
    IconModule,
    ButtonModule,
    NgForOf,
    NgSwitchCase,
    NgIf,
    NgSwitchDefault,
    StatusLabelModule,
    TranslateModule,
  ],
})
export class HouseholdTableComponent implements OnInit, OnChanges {
  @Input()
  public person!: HouseholdMember[];

  @ViewChild(SortDirective, { static: true })
  public sort!: SortDirective;

  columns: Column[] = [];
  columnsToDisplay: string[] = [
    TableColumnIds.DATA_LOCK_ICON,
    TableColumnIds.SEX_CODE,
    TableColumnIds.OFFICIAL_NAME,
    TableColumnIds.FIRST_NAME,
    TableColumnIds.DATE_OF_BIRTH,
    TableColumnIds.EG_ID,
    TableColumnIds.EW_ID,
    TableColumnIds.RESIDENCE_TYPE
  ];

  public dataSource = new TableDataSource<any>([]);

  constructor(private readonly translate: TranslateService,
              private readonly customRouting: CustomRoutingService,
              private readonly maskedPipe: MaskedPipe,
              private readonly datePipe: DatePipe) {
    this.columns = this.columnsToDisplay.map((it) => ({
      title: this.translate.instant('person-detail.columnsHousehold.' + it),
      expression: it,
    }));
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['person']) {
      this.dataSource.data = this.person.map(
        (it: HouseholdMember) => ({
          sexCode: this.maskedPipe.transform(it.sexCode),
          officialName: this.maskedPipe.transform(it.nameData.officialName),
          firstName: this.maskedPipe.transform(it.nameData.firstName),
          dateOfBirth: this.datePipe.transform(this.maskedPipe.transform(it.dateOfBirth), 'dd.MM.yyyy'),
          egId: this.maskedPipe.transform(it.egId),
          ewId: this.maskedPipe.transform(it.ewId),
          dataLockIcon: dataLockToIcon(it.hasLock),
          sexIcon: sexCodeToIcon(it.sexCode),
          perId: it.perId,
          residenceType: this.maskedPipe.transform(it.residenceType),
        }),
      );
    }
  }

  onDetailClicked(rowItem: any) {
    this.customRouting.openInNewTab('person/' + rowItem[TableColumn.PER_ID]);
  }

  protected readonly TableColumnIds = TableColumnIds;
}
