import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SortDirective, TableDataSource } from '@abraxas/base-components';
import { TranslateService } from '@ngx-translate/core';
import { MaskedPipe } from '../../../../shared/pipes/masked.pipe';
import { mapMasked, valueOr } from '../../../../core/utils/types';
import { dataLockToIcon, sexCodeToIcon } from '../../../../core/utils/commons';
import { GuardianRelationshipDataViewModel, PersonWithRelationsViewModel } from '../../models/models';
import { CustomRoutingService } from '../../../../shared/services/custom-routing.service';

export interface Column {
  title: string;
  expression: string;
}

export enum TableColumnIds {
  DATA_LOCK_ICON = 'dataLockIcon',
  SEX_CODE = 'sexCode',
  TYPE_OF_RELATIONSHIP_CODE = 'typeOfRelationshipCode',
  NAME = 'name',
  FIRSTNAME = 'firstname',
  ADDRESS = 'address',
  PER_ID = 'perId',
}

@Component({
  selector: 'app-guardianship-table',
  templateUrl: './guardianship-table.component.html',
  styleUrls: ['./guardianship-table.component.scss'],
})
export class GuardianshipTableComponent implements OnInit, OnChanges {
  @Input()
  public person!: PersonWithRelationsViewModel;

  @ViewChild(SortDirective, { static: true })
  public sort!: SortDirective;

  columns: Column[] = [];
  columnsToDisplay: string[] = [
    TableColumnIds.DATA_LOCK_ICON,
    TableColumnIds.SEX_CODE,
    TableColumnIds.TYPE_OF_RELATIONSHIP_CODE,
    TableColumnIds.NAME,
    TableColumnIds.FIRSTNAME,
    TableColumnIds.ADDRESS,
    TableColumnIds.PER_ID,
  ];

  public dataSource = new TableDataSource<any>([]);

  constructor(
    private readonly translate: TranslateService,
    private readonly maskedPipe: MaskedPipe,
    private readonly customRouting: CustomRoutingService
  ) {
    this.columns = this.columnsToDisplay.map((it) => ({
      title: this.translate.instant('person-detail.columnsGuardianship.' + it),
      expression: it,
    }));
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['person']) {
      this.dataSource.data = this.person.person.guardianRelationshipData.map(
        (it: GuardianRelationshipDataViewModel) => ({
          sexCode: this.maskedPipe.transform(it.sexCode),
          typeOfRelationshipCode: this.maskedPipe.transform(it.typeOfRelationshipCode),
          name: this.maskedPipe.transform(it.name),
          firstname: this.maskedPipe.transform(it.firstname),
          address: it.address,
          perId: valueOr(
            mapMasked(it.perId, (its) => its.personId),
            null
          ),
          dataLockIcon: dataLockToIcon(it.hasLock),
          sexIcon: sexCodeToIcon(it.sexCode),
        })
      );
    }
  }

  onDetailClicked(rowItem: any) {
    this.customRouting.openInNewTab('person/' + rowItem[TableColumnIds.PER_ID]);
  }

  protected readonly TableColumnIds = TableColumnIds;
}
