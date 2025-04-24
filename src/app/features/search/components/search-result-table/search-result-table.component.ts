import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  ButtonModule,
  IconModule,
  SortDirective,
  StatusLabelModule,
  TableDataSource,
  TableModule,
} from '@abraxas/base-components';
import { DatePipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { MaskedPipe } from '../../../../shared/pipes/masked.pipe';
import { mapMasked, MaskedValue } from '../../../../core/utils/types';
import {
  dataLockToIcon,
  getTodayAsUTCString,
  sexCodeToIcon,
} from '../../../../core/utils/commons';
import { PersonSearchResult } from '../../models/models';
import { CustomRoutingService } from '../../../../shared/services/custom-routing.service';
import { saveAs as fileSaver } from 'file-saver';
import { asBlob, generateCsv, mkConfig } from 'export-to-csv';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionService } from '../../../../core/services/permission.service';

export enum TableColumn {
  PER_ID = 'perId',
  DATA_LOCK_ICON = 'dataLockIcon',
  SEX_ICON = 'sexIcon',
  OFFICIAL_NAME = 'officialName',
  FIRST_NAME = 'firstName',
  ALLIANCE_NAME = 'allianceName',
  DATE_OF_BIRTH = 'dateOfBirth',
  STREET = 'street',
  HOUSE_NUMBER = 'houseNumber',
  ZIP_CODE = 'zipCode',
  TOWN = 'town',
  REPORTING_MUNICIPALITY = 'reportingMunicipality',
  RESIDENCES = 'residences',
  PERSON_STATUS = 'personStatus',
  PERSON_EVAL_DATE = 'personEvalDate',
}

type SearchResultRow = {
  [TableColumn.DATA_LOCK_ICON]: string;
  [TableColumn.SEX_ICON]: string;
  [TableColumn.PER_ID]: string;
  [TableColumn.OFFICIAL_NAME]: string;
  [TableColumn.FIRST_NAME]: string;
  [TableColumn.ALLIANCE_NAME]: string;
  [TableColumn.DATE_OF_BIRTH]: string;
  [TableColumn.STREET]: string;
  [TableColumn.HOUSE_NUMBER]: string;
  [TableColumn.ZIP_CODE]: string;
  [TableColumn.TOWN]: string;
  [TableColumn.REPORTING_MUNICIPALITY]: string;
  [TableColumn.RESIDENCES]: any[];
  [TableColumn.PERSON_STATUS]: string;
  [TableColumn.PERSON_EVAL_DATE]: string;
};

@Component({
  selector: 'app-search-result-table',
  templateUrl: './search-result-table.component.html',
  styleUrls: ['./search-result-table.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    ButtonModule,
    TableModule,
    NgSwitch,
    IconModule,
    StatusLabelModule,
    NgIf,
    NgForOf,
    NgSwitchCase,
    NgSwitchDefault,
  ],
})
export class SearchResultTableComponent implements OnChanges, OnInit {
  @Input()
  data: PersonSearchResult[] = [];

  public columns = TableColumn;
  public columnsToDisplay: string[] = [
    TableColumn.DATA_LOCK_ICON,
    TableColumn.SEX_ICON,
    TableColumn.OFFICIAL_NAME,
    TableColumn.FIRST_NAME,
    TableColumn.ALLIANCE_NAME,
    TableColumn.DATE_OF_BIRTH,
    TableColumn.STREET,
    TableColumn.HOUSE_NUMBER,
    TableColumn.ZIP_CODE,
    TableColumn.TOWN,
    TableColumn.REPORTING_MUNICIPALITY,
    TableColumn.RESIDENCES,
  ];

  rows: SearchResultRow[] = [];

  @ViewChild(SortDirective, { static: true })
  public sort!: SortDirective;

  public dataSource = new TableDataSource<SearchResultRow>([]);

  public searchExportAllowed = false;

  constructor(
    private readonly maskedPipe: MaskedPipe,
    private readonly datePipe: DatePipe,
    private readonly translate: TranslateService,
    private readonly customRouting: CustomRoutingService,
    private readonly permissionService: PermissionService
  ) {
    this.permissionService.permission().subscribe({
      next: (it) => {
        this.searchExportAllowed = it.searchExport;
      },
    });
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = changes['data'].currentValue.map((it: PersonSearchResult) => this.toRow(it));
    }
  }

  personStatus(personStatus: number,
               hasLock: MaskedValue<boolean>): 'active' | 'inactive' | 'locked' {
    if (personStatus !== 0) {
      return 'inactive';
    }
    if (hasLock.type === 'Value' && (hasLock.value !== undefined && hasLock.value)) {
      return 'locked';
    }
    return 'active';
  }

  onDetailClicked(row: any) {
    const evalDate = row[TableColumn.PERSON_EVAL_DATE] ?? getTodayAsUTCString();

    this.customRouting.openInNewTab('person/' + row[TableColumn.PER_ID] + '/' + evalDate);
  }

  downloadFile() {
    fileSaver.saveAs(this.dataToCSV(), this.translate.instant('search.search-table.export.filename') + '.csv');
  }

  dataToCSV(): Blob {

    const csvConfig = mkConfig({
      columnHeaders: [
        {
          key: TableColumn.DATA_LOCK_ICON,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.DATA_LOCK_ICON),
        },
        {
          key: TableColumn.SEX_ICON,
          displayLabel: this.translate.instant('search.search-table.export.column.gender'),
        },
        {
          key: TableColumn.OFFICIAL_NAME,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.OFFICIAL_NAME),
        },
        {
          key: TableColumn.FIRST_NAME,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.FIRST_NAME),
        },
        {
          key: TableColumn.ALLIANCE_NAME,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.ALLIANCE_NAME),
        },
        {
          key: TableColumn.DATE_OF_BIRTH,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.DATE_OF_BIRTH),
        },
        {
          key: TableColumn.STREET,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.STREET),
        },
        {
          key: TableColumn.HOUSE_NUMBER,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.HOUSE_NUMBER),
        },
        {
          key: TableColumn.ZIP_CODE,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.ZIP_CODE),
        },
        {
          key: TableColumn.TOWN,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.TOWN),
        },
        {
          key: TableColumn.REPORTING_MUNICIPALITY,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.REPORTING_MUNICIPALITY),
        },
        {
          key: TableColumn.RESIDENCES,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.RESIDENCES),
        },
      ],
    });
    // PERREGIST-5590: Das Semikolon muss als Trennzeichen verwendet werden
    csvConfig.fieldSeparator = ';';
    const csv = generateCsv(csvConfig)(this.dataSource.data.map(it => this.toCsvRow(it)) as any);
    return asBlob(csvConfig)(csv);
  }

  private toCsvRow(row: SearchResultRow) {
    let temp = { ...row } as any;
    temp[TableColumn.RESIDENCES] = temp[TableColumn.RESIDENCES]
      .map((code: string) => this.exportResidenceCode(code))
      .join(',');
    temp[TableColumn.SEX_ICON] = this.exportSexIcon(temp[TableColumn.SEX_ICON]);
    temp[TableColumn.DATA_LOCK_ICON] = temp[TableColumn.DATA_LOCK_ICON] ? this.translate.instant('search.search-table.column-title.' + TableColumn.DATA_LOCK_ICON) : '';
    return temp;
  }

  private exportResidenceCode(code: string) {
    switch (code) {
      case '1':
        return this.translate.instant('search.search-table.residence-short.mainResidenceShort');
      case '2':
        return this.translate.instant('search.search-table.residence-short.secondaryResidenceShort');
      case '3':
        return this.translate.instant('search.search-table.residence-short.otherResidenceShort');
      default:
        return undefined;
    }
  }

  private exportSexIcon(iconName: string) {
    if (iconName === 'mars' || iconName === 'venus' || iconName === 'question-circle-o') {
      return this.translate.instant('search.search-table.export.gender.' + iconName);
    }
    return iconName;
  }

  private toRow(result: PersonSearchResult): SearchResultRow {
    return {
      perId: result.perId,
      officialName: this.maskedPipe.transform(result.officialName),
      firstName: this.maskedPipe.transform(result.firstName),
      allianceName: this.maskedPipe.transform(result.allianceName),
      dateOfBirth: this.maskedPipe.transform(
        mapMasked(result.dateOfBirth, (it) => this.datePipe.transform(it, 'dd.MM.yyyy')!),
      ),
      reportingMunicipality: this.maskedPipe.transform(result.reportingMunicipalityName),
      street: this.maskedPipe.transform(result.address.address.street),
      houseNumber: this.maskedPipe.transform(result.address.address.houseNumber),
      zipCode: this.maskedPipe.transform(result.address.address.swissZipCode),
      town: this.maskedPipe.transform(result.address.address.town),
      dataLockIcon: dataLockToIcon(result.hasLock),
      sexIcon: sexCodeToIcon(result.sexCode),
      residences: this.formatResidences(result.residences),
      personStatus: this.personStatus(result.personStatus, result.hasLock),
      personEvalDate: result.personEvalDate,
    } as SearchResultRow;
  }

  private formatResidences(
    residences: MaskedValue<any[]>,
  ): string[] {
    if (residences.type === 'Masked') {
      return [this.maskedPipe.transform({ type: 'Masked' })];
    } else if (residences.value === undefined) {
      return [];
    }

    // The conversion to a set and the sorting is just to make sure we always have the same
    // order and don't display multiples of the same kind of residence badge.
    return [...new Set(residences.value)]
      .map((it) => {
        return it + '';
      })
      .sort();
  }

}
