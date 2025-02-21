import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SortDirective, TableDataSource } from '@abraxas/base-components';
import { DatePipe } from '@angular/common';
import { MaskedPipe } from '../../../../shared/pipes/masked.pipe';
import { mapMasked, MaskedValue, valueOr } from '../../../../core/utils/types';
import {
  dataLockToIcon,
  getTodayAsUTCString,
  getValidFromAsUTCString,
  sexCodeToIcon,
} from '../../../../core/utils/commons';
import { PersonSearchResult } from '../../models/models';
import { CustomRoutingService } from '../../../../shared/services/custom-routing.service';
import { DialogData } from '../../../common/components/history-selector/history-selector.component';
import { saveAs as fileSaver } from 'file-saver';
import { asBlob, generateCsv, mkConfig } from 'export-to-csv';
import { TranslateService } from '@ngx-translate/core';
import { PermissionService } from '../../../../core/services/permission.service';

export enum TableColumn {
  PER_ID = 'perId',
  DATA_LOCK_ICON = 'dataLockIcon',
  SEX_ICON = 'sexIcon',
  NAME = 'name',
  CALL_NAME = 'callName',
  ALLIANCE_NAME = 'allianceName',
  DATE_OF_BIRTH = 'dateOfBirth',
  REPORTING_MUNICIPALITY_WITH_CANTON_ABBREVIATION = 'reportingMunicipalityWithCantonAbbreviation',
  STREET = 'street',
  HOUSE_NUMBER = 'houseNumber',
  ZIP_CODE = 'zipCode',
  TOWN = 'town',
  RESIDENCES = 'residences',
  PERSON_STATUS = 'personStatus',
  PERSON_EVAL_DATE = 'personEvalDate',
}

type SearchResultRow = {
  [TableColumn.DATA_LOCK_ICON]: string;
  [TableColumn.SEX_ICON]: string;
  [TableColumn.PER_ID]: string;
  [TableColumn.CALL_NAME]: string;
  [TableColumn.NAME]: string;
  [TableColumn.ALLIANCE_NAME]: string;
  [TableColumn.DATE_OF_BIRTH]: string;
  [TableColumn.REPORTING_MUNICIPALITY_WITH_CANTON_ABBREVIATION]: string;
  [TableColumn.STREET]: string;
  [TableColumn.HOUSE_NUMBER]: string;
  [TableColumn.ZIP_CODE]: string;
  [TableColumn.TOWN]: string;
  [TableColumn.RESIDENCES]: any[];
  [TableColumn.PERSON_STATUS]: string;
  [TableColumn.PERSON_EVAL_DATE]: string;
};

@Component({
  selector: 'app-search-result-table',
  templateUrl: './search-result-table.component.html',
  styleUrls: ['./search-result-table.component.scss'],
})
export class SearchResultTableComponent implements OnChanges, OnInit {
  @Input()
  data: PersonSearchResult[] = [];
  @Input()
  historySelector: DialogData | undefined;

  public columns = TableColumn;
  public columnsToDisplay: string[] = [
    TableColumn.DATA_LOCK_ICON,
    TableColumn.SEX_ICON,
    TableColumn.NAME,
    TableColumn.CALL_NAME,
    TableColumn.ALLIANCE_NAME,
    TableColumn.DATE_OF_BIRTH,
    TableColumn.REPORTING_MUNICIPALITY_WITH_CANTON_ABBREVIATION,
    TableColumn.STREET,
    TableColumn.HOUSE_NUMBER,
    TableColumn.ZIP_CODE,
    TableColumn.TOWN,
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

  public formatInactiveResidences(personStatus: string): 'dark' | 'light' {
    if (personStatus === 'active') {
      return 'dark';
    }
    return 'light';
  }

  onDetailClicked(row: any) {
    if (row[TableColumn.PERSON_EVAL_DATE]) {
      this.customRouting.openInNewTab('person/' + row[TableColumn.PER_ID] + '/' + row[TableColumn.PERSON_EVAL_DATE]);
    } else if (this.historySelector?.selectedHistoryDate && this.historySelector?.selectedHistorySearchType) {
      this.customRouting.openInNewTab(
        'person/' +
        row[TableColumn.PER_ID] +
        '/' +
        getValidFromAsUTCString(
          this.historySelector?.selectedHistoryDate,
          this.historySelector?.selectedHistorySearchType,
        ),
      );
    } else {
      this.customRouting.openInNewTab('person/' + row[TableColumn.PER_ID] + '/' + getTodayAsUTCString());
    }
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
          key: TableColumn.NAME,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.NAME),
        },
        {
          key: TableColumn.CALL_NAME,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.CALL_NAME),
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
          key: TableColumn.REPORTING_MUNICIPALITY_WITH_CANTON_ABBREVIATION,
          displayLabel: this.translate.instant('search.search-table.column-title.' + TableColumn.REPORTING_MUNICIPALITY_WITH_CANTON_ABBREVIATION),
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
    if (iconName === 'mars' || iconName === 'venus' || iconName === 'transgender') {
      return this.translate.instant('search.search-table.export.gender.' + iconName);
    }
    return iconName;
  }

  private toRow(result: PersonSearchResult): SearchResultRow {
    return {
      perId: result.perId,
      callName: this.maskedPipe.transform(result.callName),
      name: this.maskedPipe.transform(result.name),
      allianceName: this.maskedPipe.transform(result.allianceName),
      dateOfBirth: this.maskedPipe.transform(
        mapMasked(result.dateOfBirth, (it) => this.datePipe.transform(it, 'dd.MM.yyyy')!),
      ),
      reportingMunicipalityWithCantonAbbreviation: this.maskedPipe.transform(
        this.formatReportingMunicipalityNameWithCantonAbbreviation(
          result.reportingMunicipalityName,
          result.reportingMunicipalityCantonAbbreviation,
        ),
      ),
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

  private formatReportingMunicipalityNameWithCantonAbbreviation(
    reportingMunicipalityName: MaskedValue<string>,
    reportingMunicipalityCantonAbbreviation: MaskedValue<string>,
  ): MaskedValue<string> {
    if (reportingMunicipalityName.type === 'Masked' && reportingMunicipalityCantonAbbreviation.type === 'Masked') {
      return { type: 'Masked' };
    }

    const cantonAbbreviation = valueOr(reportingMunicipalityCantonAbbreviation, '');
    return {
      type: 'Value',
      value: `${valueOr(reportingMunicipalityName, '')} ${cantonAbbreviation == '' ? '' : cantonAbbreviation}`,
    };
  }

}
