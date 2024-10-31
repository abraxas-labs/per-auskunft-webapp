import { MaskedValue } from '../../../core/utils/types';
import { MaskedDwellingAddressV2 } from '../../../core/models/models';

export interface SearchAttributes {
  name: any;
  firstName: any;
  allianceName: any;
  dateOfBirth: any;
  street: any;
  houseNumber: any;
  zipCode: any;
  town: any;
  reportingMunicipalityCode: any;
  vn: any;
  id: any;
  activeOnly: boolean;
  evalDate: any;
}

export interface FullTextSearchAttributes {
  fullTextSearch: any;
  activeOnly: boolean;
  evalDate: any;
}

export interface SearchResult {
  result?: Page<PersonSearchResult>;
  errors?: string[];
}

export type Page<T> = {
  pageSize: number;
  totalItems: number;
  offset: number;
  totalPages: number;
  pageNumber: number;
  items: T[];
};
export type PersonSearchResult = {
  perId: string;
  sexCode: MaskedValue<string>;
  callName: MaskedValue<string>;
  name: MaskedValue<string>;
  allianceName: MaskedValue<string>;
  dateOfBirth: MaskedValue<string>;
  address: MaskedDwellingAddressV2;
  reportingMunicipalityCantonAbbreviation: MaskedValue<string>;
  reportingMunicipalityName: MaskedValue<string>;
  residences: MaskedValue<any[]>;
  personStatus: number;
  personEvalDate: string;
  hasLock: MaskedValue<boolean>;
};
