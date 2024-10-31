import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  MaskedDestination,
  MaskedDwellingAddress,
  MaskedResidenceDwellingData,
  NaturalPersonViewModel,
} from '../../models/models';
import { SortDirective, TableDataSource } from '@abraxas/base-components';
import { TranslateService } from '@ngx-translate/core';
import { MaskedPipe } from '../../../../shared/pipes/masked.pipe';
import { concatMaskedValues, MaskedValue, value } from '../../../../core/utils/types';
import { DatePipe } from '@angular/common';

export interface Column {
  title: string;
  expression: string;
}

export enum TableColumnIds {
  RESIDENCE_CODE = 'residenceCode',
  ARRIVAL_DATE = 'arrivalDate',
  MOVING_DATE = 'movingDate',
  DEPARTURE_DATE = 'departureDate',
  MUNICIPALITY_WITH_CANTON_ABBREVIATION = 'municipalityWithCantonAbbreviation',
  ADDRESS = 'address',
  DOMICILE_DATA = 'domicileData',
  COMES_FROM_TOWN = 'comesFromTown',
  GOES_TO_ADDRESS = 'goesToAddress'
}

@Component({
  selector: 'app-residences-table',
  templateUrl: './residences-table.component.html',
  styleUrls: ['./residences-table.component.scss'],
})
export class ResidencesTableComponent implements OnInit, OnChanges {
  @Input()
  public person!: NaturalPersonViewModel;
  @ViewChild(SortDirective, { static: true })
  public sort!: SortDirective;

  columns: Column[] = [];
  columnsToDisplay: string[] = [
    TableColumnIds.RESIDENCE_CODE,
    TableColumnIds.ARRIVAL_DATE,
    TableColumnIds.MOVING_DATE,
    TableColumnIds.DEPARTURE_DATE,
    TableColumnIds.MUNICIPALITY_WITH_CANTON_ABBREVIATION,
    TableColumnIds.ADDRESS,
    TableColumnIds.DOMICILE_DATA,
    TableColumnIds.COMES_FROM_TOWN,
    TableColumnIds.GOES_TO_ADDRESS,
  ];

  public dataSource = new TableDataSource<any>([]);
  public noResidences = false;

  constructor(
    private readonly translate: TranslateService,
    private readonly maskedPipe: MaskedPipe,
    private readonly datePipe: DatePipe,
  ) {
    this.columns = this.columnsToDisplay.map((it) => ({
      title: this.translate.instant('person-detail.columnsResidences.' + it),
      expression: it,
    }));
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['person']) {
      this.dataSource.data = this.person.residenceData.map(
        (it: MaskedResidenceDwellingData) => ({
          residenceCode: it.residenceCode,
          arrivalDate: this.maskedPipe.transform(it.residenceData.arrivalDate),
          movingDate: this.maskedPipe.transform(it.residenceData.dwellingAddresses.movingDate),
          departureDate: this.maskedPipe.transform(it.residenceData.departureDate),
          municipalityWithCantonAbbreviation: this.maskedPipe.transform(this.formatMunicipalityWithCantonAbbreviation(it.residenceData.reportingMunicipality.municipalityName, it.residenceData.reportingMunicipality.cantonAbbreviation, false)),
          address: this.formatAddress(it.residenceData.dwellingAddresses),
          domicileData: this.formatDomicile(it.residenceData.dwellingAddresses.typeOfHouseholdCode, it.dwellingInformation.floor, it.dwellingInformation.locationOfDwellingOnFloor, it.dwellingInformation.noOfHabitableRooms),
          comesFromTown: this.formatComesFrom(it.residenceData.comesFrom),
          goesToAddress: this.formatGoesTo(it.residenceData.goesTo),
        }),
      );
      this.noResidences = this.dataSource.data.length === 0;
    }
  }

  public postFormatDate(date: string): string | null{
    try {
      return this.datePipe.transform(date, 'dd.MM.yyyy')
    } catch (e) {
      return date;
    }
  }

  private formatDomicile(
    typeOfHouseholdCode: MaskedValue<string>,
    floor: MaskedValue<string>,
    locationOfDwellingOnFloor: MaskedValue<string>,
    noOfHabitableRooms: MaskedValue<string>,
  ): string[] {
    return this.unmaskList([
      this.getTypeOfHousehold(typeOfHouseholdCode),
      this.getFloor(floor),
      locationOfDwellingOnFloor,
      this.getNoOfHabitableRooms(noOfHabitableRooms)]);
  }

  private formatAddress(
    address: MaskedDwellingAddress | undefined,
  ): any[] {
    if (address === undefined) return [];
    return this.unmaskList([
      address.address.addressLine1,
      concatMaskedValues(' ', address.address.street, address.address.houseNumber),
      concatMaskedValues(' ', address.address.swissZipCode, address.address.town),
    ]);
  }

  private formatMunicipalityWithCantonAbbreviation(
    municipalityName: MaskedValue<string>,
    cantonAbbreviation: MaskedValue<string>,
    tailingComma: boolean

  ): MaskedValue<string> {
    return concatMaskedValues(' ', municipalityName, this.formatCantonAbbreviation(cantonAbbreviation, tailingComma));
  }

  private formatCantonAbbreviation(
    municipalityId: MaskedValue<string>,
    tailingComma: boolean
  ): MaskedValue<string> {
    if (municipalityId.type === 'Masked' || municipalityId.value === undefined) return municipalityId;
    const val = tailingComma ? municipalityId.value + ',' : municipalityId.value;
    return value(val);
  }

  private formatGoesTo(
    destination: MaskedDestination,
  ): string[] {

    return this.unmaskList([
      this.formatGeneralPlace(destination, false),
      destination.mailAddress.addressLine1,
      concatMaskedValues(' ', destination.mailAddress.street, destination.mailAddress.houseNumber),
      concatMaskedValues(' ', this.findZipCode(destination.mailAddress.swissZipCode, destination.mailAddress.foreignZipCode), destination.mailAddress.town),
      destination.mailAddress.locality,
      destination.mailAddress.country,
    ]);
  }

  private formatComesFrom(
    destination: MaskedDestination,
  ): string[] {

    return this.unmaskList([
      this.formatGeneralPlace(destination, false),
    ]);
  }

  private formatGeneralPlace(
    destination: MaskedDestination,
    tailingComma: boolean,
  ): MaskedValue<string> {

    if (destination.generalPlace.unknown.type === 'Value' && destination.generalPlace.unknown.value) {
      return value(tailingComma ? this.translate.instant('general.unknown') + ',' : this.translate.instant('general.unknown'));
    }

    if ((destination.generalPlace.swissTown.municipalityName.type === 'Value' && destination.generalPlace.swissTown.municipalityName.value) ||
      (destination.generalPlace.swissTown.cantonAbbreviation.type === 'Value' && destination.generalPlace.swissTown.cantonAbbreviation.value)) {
      return this.formatMunicipalityWithCantonAbbreviation(destination.generalPlace.swissTown.municipalityName, destination.generalPlace.swissTown.cantonAbbreviation, tailingComma);
    }

    if ((destination.generalPlace.foreignCountry.town.type === 'Value' && destination.generalPlace.foreignCountry.town.value) ||
      (destination.generalPlace.foreignCountry.country.countryNameShort.type === 'Value' && destination.generalPlace.foreignCountry.country.countryNameShort.value)) {
      return this.formatForeignTownCountry(destination.generalPlace.foreignCountry.town, destination.generalPlace.foreignCountry.country.countryNameShort, tailingComma);
    }

    return value(undefined);
  }

  private formatForeignTownCountry(
    foreignTown: MaskedValue<string>,
    foreignCountry: MaskedValue<string>,
    tailingComma: boolean,
  ): MaskedValue<string> {
    if (foreignTown.type === 'Value' && !foreignTown.value && foreignCountry.type === 'Value' && foreignCountry.value) {
      return value(tailingComma ? foreignCountry.value + ',' : foreignCountry.value);
    }

    if (foreignCountry.type === 'Value' && !foreignCountry.value && foreignTown.type === 'Value' && foreignTown.value) {
      return value(tailingComma ? foreignTown.value + ',' : foreignTown.value);
    }

    if (foreignCountry.type === 'Value' && foreignCountry.value && foreignTown.type === 'Value' && foreignTown.value) {
      return value(tailingComma ? foreignTown.value + ', ' + foreignCountry.value + ',' : foreignTown.value + ', ' + foreignCountry.value);
    }

    return value(undefined);
  }

  private findZipCode(
    swissZipCode: MaskedValue<string>,
    foreignZipCode: MaskedValue<string>,
  ): MaskedValue<any> {
    if (swissZipCode.type === 'Value' && swissZipCode.value !== undefined) {
      return swissZipCode;
    }

    if (foreignZipCode.type === 'Value' && foreignZipCode.value !== undefined) {
      return foreignZipCode;
    }

    return swissZipCode;
  }


  private getTypeOfHousehold(
    typeOfHouseholdCode: MaskedValue<string>,
  ): MaskedValue<string> | undefined {
    if (!typeOfHouseholdCode) return undefined;

    if (typeOfHouseholdCode.type !== 'Masked' && typeOfHouseholdCode.value !== undefined) {
      switch (typeOfHouseholdCode.value) {
        case '1':
          return value(this.translate.instant('person-detail.householdTypes.private_household'));
        case '2':
          return value(this.translate.instant('person-detail.householdTypes.collective_household'));
        case '3':
          return value(this.translate.instant('person-detail.householdTypes.collection_household'));
        default:
          return value(this.translate.instant('person-detail.householdTypes.undefined_household'));
      }
    }
    return typeOfHouseholdCode;
  }

  private getFloor(
    floor: MaskedValue<string>,
  ): MaskedValue<string> | undefined {
    if (!floor) return undefined;

    if (floor.type !== 'Masked' && floor.value !== undefined) {
      const floorAsInt = parseInt(floor.value);
      if (floorAsInt === 3100) {
        return value(this.translate.instant('person-detail.floorTypes.groundFloor'));
      }
      if (floorAsInt > 3100 && floorAsInt < 3200) {
        return value((floorAsInt - 3100) + '. ' + this.translate.instant('person-detail.floorTypes.upperFloor'));
      }
      if (floorAsInt > 3400 && floorAsInt < 3420) {
        return value((floorAsInt - 3400) + '. ' + this.translate.instant('person-detail.floorTypes.lowerFloor'));
      }
    }
    return floor;
  }

  private getNoOfHabitableRooms(
    noOfHabitableRooms: MaskedValue<string>,
  ): MaskedValue<string> | undefined {
    if (!noOfHabitableRooms) return undefined;

    if (noOfHabitableRooms.type !== 'Masked' && noOfHabitableRooms.value !== undefined) {
      return value(noOfHabitableRooms.value + ' ' + this.translate.instant('person-detail.rooms'));

    }
    return noOfHabitableRooms;
  }

  private unmaskList(
    maskedList: any[],
  ): string[] {
    let allMasked = true;
    let allUndefined = true;
    maskedList = maskedList.filter(it => it);
    for (const entry of maskedList) {
      if (entry.type !== 'Masked') {
        allMasked = false;
        if (entry.value !== undefined) {
          allUndefined = false;
        }
      }
    }
    if (allMasked || allUndefined) {
      return [this.maskedPipe.transform(maskedList[0])];
    }
    return maskedList.filter(it => (it.type === 'Value' && it.value !== undefined)).map(it => this.maskedPipe.transform(it));
  }

  protected readonly TableColumnIds = TableColumnIds;

}
