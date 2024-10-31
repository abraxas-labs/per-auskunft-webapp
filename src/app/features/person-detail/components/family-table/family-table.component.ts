import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { RelatedPersonViewModel } from '../../models/models';
import { SortDirective, TableDataSource } from '@abraxas/base-components';
import { TranslateService } from '@ngx-translate/core';
import { CustomRoutingService } from '../../../../shared/services/custom-routing.service';

export interface Column {
  title: string;
  expression: string;
}

export enum TableColumnIds {
  DATA_LOCK_ICON = 'dataLockIcon',
  SEX_CODE = 'sexCode',
  TYPE_OF_RELATIONSHIP = 'typeOfRelationship',
  NAME = 'officialName',
  FIRSTNAME = 'firstName',
  ALLIANCE_NAME = 'allianceName',
  ORIGINAL_NAME = 'originalName',
  ALIAS_NAME = 'aliasName',
  DATE_OF_BIRTH = 'dateOfBirth',
  CARE = 'care',
  MARITAL_STATUS = 'maritalStatus',
  NATIONALITY = 'nationality',
  ADDRESS = 'address',
  CONTACT_ADDRESS = 'contactAddress',
  PER_ID = 'perId',
}

@Component({
  selector: 'app-family-table',
  templateUrl: './family-table.component.html',
  styleUrls: ['./family-table.component.scss'],
})
export class FamilyTableComponent implements OnChanges, OnInit {
  @Input()
  public familyRelations!: RelatedPersonViewModel[];

  @ViewChild(SortDirective, { static: true })
  public sort!: SortDirective;

  columns: Column[] = [];
  columnsToDisplay: string[] = [
    TableColumnIds.DATA_LOCK_ICON,
    TableColumnIds.SEX_CODE,
    TableColumnIds.TYPE_OF_RELATIONSHIP,
    TableColumnIds.NAME,
    TableColumnIds.FIRSTNAME,
    TableColumnIds.ALLIANCE_NAME,
    TableColumnIds.ORIGINAL_NAME,
    TableColumnIds.ALIAS_NAME,
    TableColumnIds.DATE_OF_BIRTH,
    TableColumnIds.MARITAL_STATUS,
    TableColumnIds.NATIONALITY,
    TableColumnIds.ADDRESS,
    TableColumnIds.CONTACT_ADDRESS,
    TableColumnIds.CARE,
    TableColumnIds.PER_ID,
  ];

  public dataSource = new TableDataSource<any>([]);

  constructor(
    private readonly translate: TranslateService,
    private readonly customRouting: CustomRoutingService
  ) {
    this.columns = this.columnsToDisplay.map((it) => ({
      title: this.translate.instant('person-detail.columnsFamilyRelations.' + it),
      expression: it,
    }));
  }

  protected readonly TableColumnIds = TableColumnIds;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['familyRelations']) {
      this.dataSource.data = changes['familyRelations'].currentValue;
    }
  }

  onDetailClicked(row: any) {
    this.customRouting.openInNewTab('person/' + row[TableColumnIds.PER_ID]);
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
  }
}
