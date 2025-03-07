import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  map,
  Observable,
  switchMap
} from 'rxjs';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import {
  concatMaskedValues,
  concatTwoMaskedValues,
  mapMasked,
  masked,
  MaskedValue,
  value,
  valueOr,
} from '../../../core/utils/types';
import { environment } from '../../../../environments/environment';
import {
  AdditionalDataViewModel,
  GeneralPlaceViewModel,
  Marriage,
  MaskedAddressInformation,
  MaskedAssociatedPerson,
  MaskedDeathData,
  MaskedGeneralPlace,
  MaskedGuardianRelationshipData,
  MaskedLock,
  MaskedNameOfParent,
  MaskedNaturalPersonAddonData,
  MaskedResidenceDwellingData,
  NaturalPersonDTO,
  NaturalPersonViewModel,
  PersonInformationViewModel,
  PersonWithRelationsDTO,
  PersonWithRelationsViewModel,
  RelatedPerson,
  RelatedPersonViewModel,
} from '../models/models';
import { MaskedPipe } from '../../../shared/pipes/masked.pipe';
import { dataLockToIcon, sexCodeToIcon } from '../../../core/utils/commons';
import { MaskedDwellingAddressV2 } from '../../../core/models/models';
import { QueryParameterService, QueryParams } from '../../../core/services/query-parameter.service';

export enum languageOfCorrespondenceCodes {
  de,
  fr,
  it,
  rm,
  en
}

@Injectable({
  providedIn: 'root',
})
export class PersonDetailService {

  constructor(
    private readonly httpClient: HttpClient,
    private readonly queryParamService: QueryParameterService,
    private readonly datePipe: DatePipe,
    private readonly maskedPipe: MaskedPipe,
    private readonly translate: TranslateService,
  ) {
  }

  public loadPersonWithDate(id: string, validFrom: string): Observable<PersonWithRelationsViewModel> {

    return this.queryParamService.activeQueryParams
      .pipe(switchMap((params) => this.doLoadPersonWithDate(id, validFrom, params)));
  }

  private doLoadPersonWithDate(
    id: string,
    validFrom: string,
    params: QueryParams): Observable<PersonWithRelationsViewModel> {

    const url = `${environment.apiBaseUrl}/auskunft/natPerson/${id}`;
    return this.httpClient
      .get<PersonWithRelationsDTO>(url, { params: params.toHttpParams().set('validFrom', validFrom) })
      .pipe(map((it) => this.toViewModelWithRelations(it)));
  }

  private toViewModelWithRelations(
    dto: PersonWithRelationsDTO,
  ): PersonWithRelationsViewModel {
    let personToView = this.toViewModel(dto);
    return {
      person: personToView,
      mainAndOtherResidenceHouseholdMembers: dto.mainAndOtherResidenceHouseholdMembers.flat(1),
      secondaryResidenceHouseholdMembers: dto.secondaryResidenceHouseholdMembers.flat(1),
      residenceInformationView: {
        ...dto.residenceInformationMasked,
        reportingOrganisationNameAndCanton: concatMaskedValues(
          ' ',
          dto.residenceInformationMasked.reportingOrganisationName,
          dto.residenceInformationMasked.reportingOrganisationCantonAbbreviation,
        ),
      },
      personStatus: dto.personStatus,
      personEvalDate: dto.personEvalDate,
      hasLock: dto.hasLock,
    };
  }

  private toViewModel(
    dto: PersonWithRelationsDTO,
  ): NaturalPersonViewModel {
    return {
      ...dto.person,
      headerLabel: this.formatHeader(dto.person),
      vn: mapMasked(dto.person.vn, (it) => this.formatAHV(it.personId)),
      birthData: {
        ...dto.person.birthData,
        dateOfBirth: this.formatDate(dto.person.birthData.dateOfBirth),
        placeOfBirth: this.toGeneralPlaceViewModel(dto.person.birthData.placeOfBirth),
        sexCode: this.translateCode('sex', dto.person.birthData.sexCode),
        nameOfFather: this.formatNameOfParent(dto.person.birthData.nameOfFather),
        nameOfMother: this.formatNameOfParent(dto.person.birthData.nameOfMother),
      },
      nameData: {
        ...dto.person.nameData,
        nameValidFrom: this.formatDate(dto.person.nameData.nameValidFrom),
        nameOnForeignPassport: concatMaskedValues(
          ' ',
          dto.person.nameData.nameOnForeignPassport.name,
          dto.person.nameData.nameOnForeignPassport.firstName,
        ),
        declaredForeignName: concatMaskedValues(
          ' ',
          dto.person.nameData.declaredForeignName.name,
          dto.person.nameData.declaredForeignName.firstName,
        ),
      },
      placesOfOrigin: dto.person.placesOfOrigin.map((it) => ({
        name: concatMaskedValues(' ', it.placeOfOrigin.originName, it.placeOfOrigin.canton),
        naturalizationDate: this.formatDate(it.placeOfOriginAddonData.naturalizationDate),
      })),
      religionData: {
        ...dto.person.religionData,
        religionCode: this.translateCode('religion', dto.person.religionData.religionCode),
      },
      residencePermitData: {
        ...dto.person.residencePermitData,
        residencePermitValidTill: this.formatDate(dto.person.residencePermitData.residencePermitValidTill),
        entryDate: this.formatDate(dto.person.residencePermitData.entryDate),
        residencePermitCode: this.translateCode(
          'residencePermit',
          dto.person.residencePermitData.residencePermitCode,
        ),
      },
      nationalityData: {
        ...dto.person.nationalityData,
        nationalityStatusCode: this.translateCode(
          'nationalityStatus',
          dto.person.nationalityData.nationalityStatusCode,
        ),
      },
      maritalInfo: {
        maritalStatusCode: this.translateCode('maritalStatus', dto.person.maritalInfo.maritalStatusCode),
        dateOfMaritalStatus: this.formatDate(dto.person.maritalInfo.dateOfMaritalStatus),
        cancellationReasonCode: this.translateCode(
          'cancellationReason',
          dto.person.maritalInfo.cancellationReasonCode,
        ),
        separationCode: this.translateCode(
          'separation',
          dto.person.maritalInfo.separationData.separationCode,
        ),
        separationValidFrom: this.formatDate(dto.person.maritalInfo.separationData.validFrom),
      },
      deathData: {
        ...dto.person.deathData,
        deathPeriodFrom: this.formatDate(dto.person.deathData.deathPeriodFrom),
      },
      guardianRelationshipData: dto.person.guardianRelationshipData.map((it) => (
        {
          typeOfRelationshipCode: this.translateCode('relation', it.maskedFilteredGuardianData.typeOfRelationshipCode),
          sexCode: it.associatedPerson.sex,
          name: this.getName(it.maskedFilteredGuardianData, it.associatedPerson),
          firstname: it.associatedPerson.firstName,
          address: this.getAddress(it.maskedFilteredGuardianData),
          perId: it.associatedPerson.perId,
          hasLock: it.associatedPerson.hasLock,
        })),

      familyRelations: dto.person.familyRelations.map((it) => this.toRelatedPersonViewModel(it)),
      additionalData: this.toAdditionalDataViewModel(
        dto.person.deathData,
        dto.person.naturalPersonAddonData,
        dto.person.politicalRightData,
        dto.person.dataLock,
      ),
      residenceData: this.concatMaps(
        this.getResidenceDataMap(dto.person.mainResidenceWithDwellingData),
        this.getResidenceDataMap(dto.person.secondaryResidenceWithDwellingData),
        this.getResidenceDataMap(dto.person.otherResidenceWithDwellingData),
      ),
    };
  }

  private getName(relationshipData: MaskedGuardianRelationshipData,
                  associatedPerson: MaskedAssociatedPerson): MaskedValue<string> {
    if (associatedPerson.officialName.type === 'Value' && associatedPerson.officialName.value) {
      return associatedPerson.officialName;
    }

    if (
      relationshipData.address.organisation.organisationName.type == 'Value' &&
      relationshipData.address.organisation.organisationName.value
    ) {
      return relationshipData.address.organisation.organisationName;
    }

    if (
      associatedPerson.officialName.type === 'Value' ||
      relationshipData.address.organisation.organisationName.type == 'Value'
    ) {
      return value(this.translate.instant(`general.partnerRelationUnknown`));
    }
    return masked();
  }

  private getAddress(it: MaskedGuardianRelationshipData): string[] {
    let address = it.address.addressInformation;

    let streetLine = concatMaskedValues(' ', address.street, address.houseNumber);
    let townLine = concatMaskedValues(
      ' ',
      concatMaskedValues('', address.swissZipCode, address.foreignZipCode),
      address.town,
    );

    return this.unmaskList([
      address.addressLine1,
      streetLine,
      townLine,
      address.country,
    ]);
  }

  private toRelatedPersonViewModel(person: RelatedPerson): RelatedPersonViewModel {
    switch (person.relationship.type) {
      case 'parent':
        return {
          typeOfRelationship: this.maskedPipe.transform(
            this.translateCode('relation', person.relationship.typeOfRelationshipCode),
          ),
          care: this.maskedPipe.transform(this.translateCode('careType', person.relationship.care)),
          ...this.handlePersonInformation(person),
        };
      case 'child':
        return {
          typeOfRelationship: this.translateChildRelationship(person),
          care: this.maskedPipe.transform(this.translateCode('careType', person.relationship.care)),
          ...this.handlePersonInformation(person),
        };
      case 'marriage':
        return {
          typeOfRelationship: this.translateMarriageRelationship(
            person.relationship,
            person.relationship.typeOfRelationshipCode,
          ),
          care: '-',
          ...this.handlePersonInformation(person),
        };
    }
  }

  private concatMaps(
    mainResidence: MaskedResidenceDwellingData[],
    secondaryResidence: MaskedResidenceDwellingData[],
    otherResidence: MaskedResidenceDwellingData[],
  ): MaskedResidenceDwellingData[] {
    return [
      ...mainResidence.map((it: MaskedResidenceDwellingData) => ({ ...it, residenceCode: '1' })),
      ...secondaryResidence.map((it: MaskedResidenceDwellingData) => ({ ...it, residenceCode: '2' })),
      ...otherResidence.map((it: MaskedResidenceDwellingData) => ({ ...it, residenceCode: '3' })),
    ];
  }

  private getResidenceDataMap(
    residenceData: any,
  ): MaskedResidenceDwellingData[] {
    if (typeof residenceData[Symbol.iterator] === 'function') { // prüft ob residenceData bereits eine Liste ist
      return residenceData;
    }
    return [residenceData];
  }

  private translateChildRelationship(person: RelatedPerson): string {
    let sex = person.type === 'missing' ? '3' : valueOr(person.sexCode, '3');
    let careCode = person.relationship.type !== 'child' ? null : valueOr(person.relationship.care, null);
    let isFoster = careCode == '5' || careCode == '6';

    return this.translate.instant('general.childTypes.' + (isFoster ? 'foster-' : '') + this.childType(sex));
  }

  private translateMarriageRelationship(
    marriage: Marriage,
    typeOfRelationshipCode: MaskedValue<string>,
  ): string {
    return valueOr(
      mapMasked(typeOfRelationshipCode, (code) => {
        let type = code === '1' ? 'spouse' : code === '2' ? 'partner' : 'unknown';
        let isActive = valueOr(marriage.isActive, null);

        if (type === 'unknown' && isActive === null) {
          return this.translate.instant('general.partnerTypes.unknown');
        }

        return this.translate.instant('general.partnerTypes.' + type + (isActive ? '-active' : '-inactive'));
      }),
      '-',
    );
  }

  private childType(sex: string) {
    switch (sex) {
      case '1':
        return 'son';
      case '2':
        return 'daughter';
      default:
        return 'unknown';
    }
  }

  private handlePersonInformation(person: RelatedPerson): PersonInformationViewModel {
    if (person.type === 'missing') {
      return {
        dataLockIcon: dataLockToIcon({ type: 'Value', value: false }),
        sexCode: sexCodeToIcon({ type: 'Value' }),
        officialName: this.translate.instant('person-detail.labels.relationMissing'),
        firstName: '-',
        allianceName: '-',
        originalName: '-',
        aliasName: '-',
        dateOfBirth: '-',
        nationality: '-',
        maritalStatus: '-',
        address: ['-'],
        contactAddress: ['-'],
      };
    }
    return {
      perId: valueOr(person.perId, undefined),
      dataLockIcon: dataLockToIcon(person.hasLock),
      sexCode: sexCodeToIcon(person.sexCode),
      officialName: this.maskedPipe.transform(person.officialName),
      firstName: this.maskedPipe.transform(person.firstName),
      allianceName: this.maskedPipe.transform(person.allianceName),
      originalName: this.maskedPipe.transform(person.originalName),
      aliasName: this.maskedPipe.transform(person.aliasName),
      dateOfBirth: this.maskedPipe.transform(this.formatDate(person.dateOfBirth)),
      nationality: this.maskedPipe.transform(person.nationality),
      maritalStatus: this.maskedPipe.transform(
        this.translateCode('maritalStatus', person.maritalInfo.maritalStatusCode),
      ),
      address: this.formatAddress(person.address),
      contactAddress: this.formatContactAddress(person.contactAddress),
    };
  }

  private translateCode(codeType: string, code: MaskedValue<string>): MaskedValue<string> {
    return mapMasked(code, (it) => this.translate.instant(`codes.${codeType}.${it}`));
  }

  private translateBool(key: string, bValue: MaskedValue<boolean>): MaskedValue<string> {
    return mapMasked(bValue, (it) => this.translate.instant(key + it));
  }

  private formatDate(date: MaskedValue<string>): MaskedValue<string> {
    return mapMasked(date, (it) => this.datePipe.transform(it, 'dd.MM.yyyy')!);
  }

  private toGeneralPlaceViewModel(dto: MaskedGeneralPlace): GeneralPlaceViewModel {
    if (dto.unknown.type === 'Value' && dto.unknown.value) {
      return {
        place: value(this.translate.instant('general.unknown')),
        country: value(this.translate.instant('general.unknown')),
      };
    }

    if ((dto.swissTown.municipalityName.type === 'Value' &&
        dto.swissTown.municipalityName.value) ||
      (dto.swissTown.cantonAbbreviation.type === 'Value' &&
        dto.swissTown.cantonAbbreviation.value)) {

      let swissPlace = concatMaskedValues(
        ' ',
        dto.swissTown.municipalityName,
        dto.swissTown.cantonAbbreviation,
      );
      return { place: swissPlace, country: value(this.translate.instant('general.swiss')) };
    }

    if (
      dto.foreignCountry.town.type === 'Value' ||
      dto.foreignCountry.country.countryNameShort.type === 'Value'
    ) {
      return { place: dto.foreignCountry.town, country: dto.foreignCountry.country.countryNameShort };
    }

    return { place: masked(), country: masked() };
  }

  private formatAHV(input: string): string {
    return input.replace(/\D+/g, '').replace(/(\d{3})(\d{4})(\d{4})(\d{2})/, '$1.$2.$3.$4');
  }

  private formatHeader(dto: NaturalPersonDTO) {
    let header = `${valueOr(dto.nameData.firstName, '')} ${valueOr(dto.nameData.officialName, '')}`;
    let birthDate = valueOr(dto.birthData.dateOfBirth, undefined);
    if (birthDate) {
      let formatted = this.datePipe.transform(birthDate, 'dd.MM.YYYY');
      header = formatted ? `${header}, ${formatted}` : header;
    }
    return header;
  }

  private formatNameOfParent(dto: MaskedNameOfParent): MaskedValue<string> {
    if (dto.firstNameOnly.type === 'Value' && dto.firstNameOnly.value) {
      return dto.firstNameOnly;
    }

    if (dto.officialNameOnly.type === 'Value' && dto.officialNameOnly.value) {
      return dto.officialNameOnly;
    }

    return concatMaskedValues(' ', dto.firstName, dto.officialName);
  }

  private toAdditionalDataViewModel(
    deathData: MaskedDeathData,
    personAddonData: MaskedNaturalPersonAddonData,
    politicalRightsData: MaskedValue<boolean>,
    dataLock: MaskedLock,
  ): AdditionalDataViewModel {
    let dateOfDeath: MaskedValue<string>;
    let dateOfMissing: MaskedValue<string>;
    if (deathData.missing.type === 'Masked') {
      dateOfMissing = masked();
      dateOfDeath = this.formatDate(deathData.deathPeriodFrom);
    } else if (deathData.missing.value) {
      dateOfMissing = this.formatDate(deathData.deathPeriodFrom);
      dateOfDeath = mapMasked(deathData.deathPeriodFrom, () => undefined);
    } else {
      dateOfMissing = { type: 'Value' };
      dateOfDeath = this.formatDate(deathData.deathPeriodFrom);
    }

    return {
      dateOfDeath,
      dateOfMissing,
      languageOfCorrespondence: this.formatLanguageOfCorrespondence(personAddonData.languageOfCorrespondance),
      restrictedVotingAndElectionRightFederation: this.translateBool(
        'person-detail.restrictedVotingAndElectionRightFederationBoolean.',
        politicalRightsData,
      ),
      lock: this.translateCode('dataLock', dataLock.valueCode),
    };
  }

  private formatLanguageOfCorrespondence(languageOfCorrespondenceShort: MaskedValue<string>): MaskedValue<string> {
    return (languageOfCorrespondenceShort?.type === 'Value' &&
      languageOfCorrespondenceShort.value !== undefined &&
      languageOfCorrespondenceCodes.hasOwnProperty(languageOfCorrespondenceShort.value.toLowerCase())) ?
      mapMasked(languageOfCorrespondenceShort,
        (it) => this.translate.instant('person-detail.languageOfCorrespondence.' + it.toLowerCase())) :
      languageOfCorrespondenceShort;
  }

  private formatAddress(
    address: MaskedDwellingAddressV2 | undefined,
  ): string[] {
    if (address === undefined) return [];
    return this.unmaskList([
      address.address.addressLine1,
      concatMaskedValues(' ', address.address.street, address.address.houseNumber),
      concatMaskedValues(' ', address.address.swissZipCode, address.address.town),
    ]);
  }

  private formatContactAddress(
    address: MaskedAddressInformation | undefined,
  ): string[] {
    if (address === undefined) return [];

    return this.unmaskList([
      address.addressLine1,
      concatMaskedValues(' ', address.street, address.houseNumber),
      concatMaskedValues(' ', address.postOfficeBoxText, address.postOfficeBoxNumber),
      concatMaskedValues(' ',
        concatMaskedValues('', address.swissZipCode, address.foreignZipCode),
        concatTwoMaskedValues(address.town, address.country, ', ')),
    ]);
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
}
