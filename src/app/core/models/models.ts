import {MaskedValue} from '../utils/types';

export type NamedPersonId = {
  personIdCategory: string;
  personId: string;
};

export type MaskedDwellingAddressV2 = {
  egid: MaskedValue<number>;
  ewid: MaskedValue<number>;
  householdId: MaskedValue<string>;
  address: MaskedSwissAddressInformation;
  typeOfHouseholdCode: MaskedValue<string>;
  movingDate: MaskedValue<string>;
  dwellingInformation: MaskedValue<boolean>;
};

export type MaskedSwissAddressInformation = {
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
};
