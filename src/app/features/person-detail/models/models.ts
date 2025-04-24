import {MaskedValue} from '../../../core/utils/types';
import {MaskedDwellingAddressV2, NamedPersonId} from '../../../core/models/models';

export type MartialInfoViewModel = {
  maritalStatusCode: MaskedValue<string>;
  dateOfMaritalStatus: MaskedValue<string>;
  officialProofOfMaritalStatusYesNo: MaskedValue<string>;
  cancellationReasonCode: MaskedValue<string>;
  separationCode: MaskedValue<string>;
  separationValidFrom: MaskedValue<string>;
  separationValidTill: MaskedValue<string>;
};
export type MaskedForeignerName = {
  name: MaskedValue<string>;
  firstName: MaskedValue<string>;
};
export type BirthDataViewModel = {
  dateOfBirth: MaskedValue<string>;
  placeOfBirth: GeneralPlaceViewModel;
  sexCode: MaskedValue<string>;
  nameOfFather: MaskedValue<string>;
  officialProofOfNameFather: MaskedValue<string>;
  nameOfMother: MaskedValue<string>;
  officialProofOfNameMother: MaskedValue<string>;
};
export type MaskedBirthData = {
  dateOfBirth: MaskedValue<string>;
  placeOfBirth: MaskedGeneralPlace;
  sexCode: MaskedValue<string>;
  nameOfFather: MaskedNameOfParent;
  nameOfMother: MaskedNameOfParent;
};
export type MaskedNameOfParent = {
  firstName: MaskedValue<string>;
  officialName: MaskedValue<string>;
  firstNameOnly: MaskedValue<string>;
  officialNameOnly: MaskedValue<string>;
  officialProofOfNameOfParentsYesNo: MaskedValue<boolean>;
};
export type GeneralPlaceViewModel = {
  place: MaskedValue<string>;
  country: MaskedValue<string>;
};
export type MaskedGeneralPlace = {
  unknown: MaskedValue<string>;
  swissTown: MaskedSwissMunicipality;
  foreignCountry: MaskedForeignCountry;
};
type MaskedSwissMunicipality = {
  municipalityId: MaskedValue<string>;
  municipalityName: MaskedValue<string>;
  cantonAbbreviation: MaskedValue<string>;
  historyMunicipalityId: MaskedValue<number>;
};
export type MaskedDestination = {
  generalPlace: MaskedGeneralPlace;
  mailAddress: MaskedAddressInformation;
};
export type MaskedDwellingAddress = {
  egid: MaskedValue<number>;
  ewid: MaskedValue<number>;
  householdId: MaskedValue<string>;
  address: MaskedSwissAddressInformation;
  typeOfHouseholdCode: MaskedValue<string>;
  movingDate: MaskedValue<string>;
  noOfHabitableRooms: MaskedValue<string>;
  floor: MaskedValue<string>;
  locationOfDwellingOnFloor: MaskedValue<string>;
};
type MaskedSwissAddressInformation = {
  addressLine1: MaskedValue<string>;
  addressLine2: MaskedValue<string>;
  street: MaskedValue<string>;
  houseNumber: MaskedValue<string>;
  dwellingNumber: MaskedValue<string>;
  locality: MaskedValue<string>;
  town: MaskedValue<string>;
  swissZipCode: MaskedValue<string>;
  swissZipCodeAddOn: MaskedValue<string>;
  swissZipCodeId: MaskedValue<number>;
  country: MaskedCountry;
};
export type MaskedAddressInformation = {
  addressLine1: MaskedValue<string>;
  addressLine2: MaskedValue<string>;
  street: MaskedValue<string>;
  houseNumber: MaskedValue<string>;
  dwellingNumber: MaskedValue<string>;
  postOfficeBoxNumber: MaskedValue<string>;
  postOfficeBoxText: MaskedValue<string>;
  locality: MaskedValue<string>;
  town: MaskedValue<string>;
  swissZipCode: MaskedValue<string>;
  swissZipCodeAddOn: MaskedValue<string>;
  swissZipCodeId: MaskedValue<number>;
  foreignZipCode: MaskedValue<string>;
  country: MaskedValue<string>;
};
type MaskedForeignCountry = {
  country: MaskedCountry;
  town: MaskedValue<string>;
};
export type MaskedCountry = {
  countryId: MaskedValue<number>;
  countryIdISO2: MaskedValue<string>;
  countryNameShort: MaskedValue<string>;
};
export type PlaceOfOriginViewModel = {
  name: MaskedValue<string>;
  naturalizationDate: MaskedValue<string>;
};
export type MaskedPlaceOfOriginData = {
  placeOfOrigin: MaskedPlaceOfOrigin;
  placeOfOriginAddonData: MaskedPlaceOfOriginAddonData;
};
export type MaskedPlaceOfOrigin = {
  originName: MaskedValue<string>;
  canton: MaskedValue<string>;
  placeOfOriginId: MaskedValue<number>;
  historyMunicipalityId: MaskedValue<number>;
}
export type MaskedPlaceOfOriginAddonData = {
  naturalizationDate: MaskedValue<string>;
  expatriationDate: MaskedValue<string>;
}
export type MaskedReligion = {
  validFrom: MaskedValue<string>;
  religionCode: MaskedValue<string>;
};
export type MaskedNationalityData = {
  nationalityStatusCode: MaskedValue<string>;
  country: MaskedCountry;
  nationalityValidFrom: MaskedValue<string>;
};
export type MaskedResidencePermitData = {
  residencePermitCode: MaskedValue<string>;
  residencePermitValidFrom: MaskedValue<string>;
  residencePermitValidTill: MaskedValue<string>;
  entryDate: MaskedValue<string>;
};
export type MaskedDeathData = {
  deathPeriodTo: MaskedValue<string>;
  deathPeriodFrom: MaskedValue<string>;
  placeOfDeath: MaskedGeneralPlace;
  missing: MaskedValue<boolean>;
};
export type MaskedExportedMaritalInfo = {
  maritalStatusCode: MaskedValue<string>;
  dateOfMaritalStatus: MaskedValue<string>;
  cancellationReasonCode: MaskedValue<string>;
  officialProofOfMaritalStatusYesNo: MaskedValue<boolean>;
  separationData: MaskedSeparationData;
  placeOfMarriage: MaskedGeneralPlace;
};
type MaskedSeparationData = {
  separationCode: MaskedValue<string>;
  validFrom: MaskedValue<string>;
  validTill: MaskedValue<string>;
};
export type MaskedLock = {
  valueCode: MaskedValue<string>;
  validFrom: MaskedValue<string>;
  validTo: MaskedValue<string>;
};

export type MaskedFilteredGuardianDataWithPerson = {
  maskedFilteredGuardianData: MaskedGuardianRelationshipData
  associatedPerson: MaskedAssociatedPerson
}
export type MaskedGuardianRelationshipData = {
  typeOfRelationshipCode: MaskedValue<string>;
  guardianRelationshipId: MaskedValue<string>;
  basedOnLaw: MaskedValue<string>;
  guardianMeasureValidFrom: MaskedValue<string>;
  guardianMeasureValidTo: MaskedValue<string>;
  partnerIdOrganisation: MaskedPartnerIdOrganisationData;
  address: MaskedMailAddress;
};
export type MaskedResidenceData = {
  arrivalDate: MaskedValue<string>;
  departureDate: MaskedValue<string>;
  reportingMunicipality: MaskedSwissMunicipality;
  dwellingAddresses: MaskedDwellingAddress;
  comesFrom: MaskedDestination;
  goesTo: MaskedDestination;
};
export type MaskedDwellingInformation = {
  floor: MaskedValue<string>;
  locationOfDwellingOnFloor: MaskedValue<string>;
  noOfHabitableRooms: MaskedValue<string>;
};
export type MaskedResidenceDwellingData = {
  residenceCode: string;
  residenceData: MaskedResidenceData;
  dwellingInformation: MaskedDwellingInformation;
  contactData: MaskedContactData;
}
export type MaskedContactData = {
  contactAddress: MaskedContactAddress;
};
export type MaskedContactAddress = {
  organisation: MaskedOrganisationMailAddressInfo;
  person: MaskedPersonMailAddressInfo;
  addressInformation: MaskedAddressInformation;
}
export type MaskedPartnerIdOrganisationData = {
  localPersonId: MaskedValue<NamedPersonId>;
  otherPersonId: MaskedValue<NamedPersonId[]>;
};

export type MaskedMailAddress = {
  organisation: MaskedOrganisationMailAddressInfo;
  person: MaskedPersonMailAddressInfo;
  addressInformation: MaskedAddressInformation;
};

type MaskedOrganisationMailAddressInfo = {
  organisationName: MaskedValue<string>;
  organisationNameAddOn1: MaskedValue<string>;
  organisationNameAddOn2: MaskedValue<string>;
  mrMrsCode: MaskedValue<string>;
  title: MaskedValue<string>;
  firstName: MaskedValue<string>;
  lastName: MaskedValue<string>;
};

type MaskedPersonMailAddressInfo = {
  mrMrsCode: MaskedValue<string>;
  title: MaskedValue<string>;
  firstName: MaskedValue<string>;
  lastName: MaskedValue<string>;
};

export type MaskedAssociatedPerson = {
  vn: MaskedValue<string>;
  perId: MaskedValue<NamedPersonId>;
  personIds: MaskedValue<string>;
  officialName: MaskedValue<string>;
  firstName: MaskedValue<string>;
  originalName: MaskedValue<string>;
  sex: MaskedValue<string>;
  dateOfBirth: MaskedValue<string>;
  address: MaskedValue<string>;
  hasLock: MaskedValue<boolean>;
};
export type GuardianRelationshipDataViewModel = {
  sexCode: MaskedValue<string>;
  typeOfRelationshipCode: MaskedValue<string>;
  name: MaskedValue<string>;
  firstname: MaskedValue<string>;
  address: string[];
  perId: MaskedValue<NamedPersonId>;
  hasLock: MaskedValue<boolean>;
};

export type PersonInformationViewModel = {
  perId?: string;
  dataLockIcon?: string;
  sexCode?: string;
  officialName: string;
  firstName: string;
  allianceName: string;
  originalName: string;
  aliasName: string;
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  address: string[];
  contactAddress: string[];
};

export type RelatedPersonViewModel = {
  typeOfRelationship: string;
  care: string;

} & PersonInformationViewModel;

export type AdditionalDataViewModel = {
  dateOfDeath: MaskedValue<string>;
  dateOfMissing: MaskedValue<string>;
  placeOfDeath: MaskedValue<string>;
  languageOfCorrespondence: MaskedValue<string>;
  restrictedVotingAndElectionRightFederation: MaskedValue<string>;
  lock: MaskedValue<string>;
};
export type MaskedNaturalPersonAddonData = {
  mrMrsCode: MaskedValue<string>;
  title: MaskedValue<string>;
  languageOfCorrespondance: MaskedValue<string>;
};
export type MaskedNameData = {
  officialName: MaskedValue<string>;
  firstName: MaskedValue<string>;
  callName: MaskedValue<string>;
  originalName: MaskedValue<string>;
  allianceName: MaskedValue<string>;
  aliasName: MaskedValue<string>;
  otherName: MaskedValue<string>;
  nameOnForeignPassport: MaskedForeignerName;
  declaredForeignName: MaskedForeignerName;
  nameValidFrom: MaskedValue<string>;
};
export type ResidenceInformationMasked = {
  address: MaskedDwellingAddressV2;
  reportingOrganisationCantonAbbreviation: MaskedValue<string>;
  reportingOrganisationName: MaskedValue<string>;
  residences: MaskedValue<string>;
};
export type ResidenceInformationViewModel = {
  address: MaskedDwellingAddressV2;
  reportingOrganisationName: MaskedValue<string>;
  residences: MaskedValue<string>;
};
export type NameDataViewModel = {
  officialName: MaskedValue<string>;
  firstName: MaskedValue<string>;
  callName: MaskedValue<string>;
  originalName: MaskedValue<string>;
  allianceName: MaskedValue<string>;
  aliasName: MaskedValue<string>;
  otherName: MaskedValue<string>;
  nameOnForeignPassport: MaskedValue<string>;
  declaredForeignName: MaskedValue<string>;
  nameValidFrom: MaskedValue<string>;
};

export type Relationship = {
  typeOfRelationshipCode: MaskedValue<string>;
} & (Marriage | Parent | Child);

export type Marriage = {
  maritalStatus: MaskedValue<string>;
  isActive: MaskedValue<boolean>;
  type: 'marriage';
};

export type Parent = {
  care: MaskedValue<string>;
  parent: true;
  type: 'parent';
};

export type Child = {
  care: MaskedValue<string>;
  parent: false;
  type: 'child';
};

export type RelatedPerson = {
  relationship: Relationship;
} & (ExistingPerson | MissingPerson);

export type MissingPerson = {
  type: 'missing';
};

export type ExistingPerson = {
  perId: MaskedValue<string>;
  sexCode: MaskedValue<string>;
  officialName: MaskedValue<string>;
  firstName: MaskedValue<string>;
  allianceName: MaskedValue<string>;
  originalName: MaskedValue<string>;
  aliasName: MaskedValue<string>;
  dateOfBirth: MaskedValue<string>;
  nationality: MaskedValue<string>;
  maritalInfo: MaskedExportedMaritalInfo;
  address: MaskedDwellingAddressV2;
  contactAddress: MaskedAddressInformation;
  hasLock: MaskedValue<boolean>;
  type: 'existing';
};

export type NaturalPersonDTO = {
  vn: MaskedValue<NamedPersonId>;
  localPersonId: NamedPersonId;
  otherPersonIds: NamedPersonId[];
  nameData: MaskedNameData;
  naturalPersonAddonData: MaskedNaturalPersonAddonData;
  birthData: MaskedBirthData;
  contactData: MaskedContactData;
  placesOfOrigin: MaskedPlaceOfOriginData[];
  religionData: MaskedReligion;
  residencePermitData: MaskedResidencePermitData;
  nationalityData: MaskedNationalityData;
  deathData: MaskedDeathData;
  maritalInfo: MaskedExportedMaritalInfo;
  politicalRightData: MaskedValue<boolean>;
  paperLock: MaskedLock;
  dataLock: MaskedLock;
  guardianRelationshipData: MaskedFilteredGuardianDataWithPerson[];
  mainResidenceWithDwellingData: MaskedResidenceDwellingData[];
  secondaryResidenceWithDwellingData: MaskedResidenceDwellingData[];
  otherResidenceWithDwellingData: MaskedResidenceDwellingData[];
  familyRelations: RelatedPerson[];
};

export type NaturalPersonViewModel = {
  headerLabel: string;
  vn: MaskedValue<string>;
  localPersonId: NamedPersonId;
  otherPersonIds: NamedPersonId[];
  nameData: NameDataViewModel;
  additionalData: AdditionalDataViewModel;
  birthData: BirthDataViewModel;
  placesOfOrigin: PlaceOfOriginViewModel[];
  religionData: MaskedReligion;
  residencePermitData: MaskedResidencePermitData;
  nationalityData: MaskedNationalityData;
  deathData: MaskedDeathData;
  maritalInfo: MartialInfoViewModel;
  guardianRelationshipData: GuardianRelationshipDataViewModel[];
  residenceData: MaskedResidenceDwellingData[];
  familyRelations: RelatedPersonViewModel[];
};
export type PersonWithRelationsDTO = {
  person: NaturalPersonDTO;
  mainAndOtherResidenceHouseholdMembers: HouseholdMember[][];
  secondaryResidenceHouseholdMembers: HouseholdMember[][];
  residenceInformationMasked: ResidenceInformationMasked;
  personStatus: number;
  personEvalDate: string;
  lockValue: MaskedValue<number>;
};
export type PersonWithRelationsViewModel = {
  person: NaturalPersonViewModel;
  mainAndOtherResidenceHouseholdMembers: HouseholdMember[];
  secondaryResidenceHouseholdMembers: HouseholdMember[];
  residenceInformationView: ResidenceInformationViewModel;
  personStatus: number;
  personEvalDate: string;
  lockValue: MaskedValue<number>;
};
export type HouseholdMember = {
  perId: string;
  egId: MaskedValue<string>;
  ewId: MaskedValue<string>;
  nameData: MaskedNameData;
  dateOfBirth: MaskedValue<string>;
  sexCode: MaskedValue<string>;
  hasLock: MaskedValue<boolean>;
  residenceType: MaskedValue<number>;
};
