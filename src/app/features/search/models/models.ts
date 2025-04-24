import { MaskedValue } from '../../../core/utils/types';
import { MaskedDwellingAddressV2 } from '../../../core/models/models';

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
  officialName: MaskedValue<string>;
  firstName: MaskedValue<string>;
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

export class ExtendedSearchDTO {
  activeOnly!: boolean;
  evalDate!: any;
  elements!: SearchElementDTO[]
}

export class SearchElementDTO {
  searchField!: string;
  operator! :string;
  values!:string[];
}
