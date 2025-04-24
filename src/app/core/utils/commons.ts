import { MaskedValue } from './types';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as moment from 'moment/moment';

export type ValidationError = {
  message: string | undefined;
  errorCode: string | undefined;
}

export function sexCodeToIcon(sexCode: MaskedValue<string>): string | undefined {
  if (sexCode.type === 'Masked') {
    return 'cancel';
  }

  switch (sexCode.value) {
    case '1':
      return 'mars';
    case '2':
      return 'venus';
    case '3':
      return 'question-circle-o';
    default:
      return undefined;
  }
}

export function dataLockToIcon(hasLock: MaskedValue<boolean>): string | undefined {
  if (hasLock.type === 'Masked') {
    return 'cancel';
  }
  if (hasLock.value) {
    return 'lock';
  }
  return '';
}


export const notAllowedCharsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (typeof control.value !== 'string') {
    return null;
  }
  // Gleiche Validierung wie auf Server --> SearchUtils.checkSearchCriterium
  const SPACE_CHAR = 32;
  const TAB_CHAR = 9;

  const searchString = control.value?.trim();
  for (let i = 0; i < searchString?.length; i++) {
    const charCodeAt = searchString?.charCodeAt(i);
    if (charCodeAt < SPACE_CHAR && charCodeAt != TAB_CHAR) {
      return {
        message: 'There are not allowed Characters in SearchTerm',
        errorCode: 'notAllowedCharacters',
      } as ValidationError;
    }
  }
  return null;
};

export const onlyDigitsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (typeof control.value !== 'string') {
    return null;
  }
  const DIGIT_ZERO = 48;
  const DIGIT_NINE = 57;
  const searchString = control.value?.trim();
  for (let i = 0; i < searchString?.length; i++) {
    const charCodeAt = searchString?.charCodeAt(i);
    if (charCodeAt < DIGIT_ZERO || charCodeAt > DIGIT_NINE) {
      return {
        message: 'only Digits allowed',
        errorCode: 'onlyDigitsAllowed',
      } as ValidationError;
    }
  }
  return null;
};

export const atLeastTwoCharacterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (typeof control.value !== 'string' || !control.value) {
    return null;
  }
  const withoutWildcards = getSearchStringWithoutWildcards(control.value);
  if (withoutWildcards.length < 2) {
    return { message: 'At least 2 characters in a search string', errorCode: 'atLeast2Characters' } as ValidationError;
  }
  return null;
};

export const noWildcardsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (typeof control.value !== 'string') {
    return null;
  }
  if (control.value?.includes('*') || control.value?.includes('?')) {
    return { message: 'No Wildcards allowed here', errorCode: 'noWildcards' };
  }
  return null;
};

function getSearchStringWithoutWildcards(search: string): string {
  // Alternative zu ReplaceAll
  return search.trim().split('*').join('').split('?').join('');
}

export function getTodayAsUTCString(): string {
  return getEvalDateAsUTCString(new Date());
}

export function getEvalDateAsUTCString(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

export function getDateFromUTCString(utcDate: string): Date {
  return new Date(utcDate);
}

export function isUTCDateStringToday(date: string): boolean {
  return getTodayAsUTCString() === date;
}

export function getDateAsString(date: Date): string {
  return moment(date).format('DD.MM.YYYY');
}

export class TechnicalError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

export function findTechnicalErrorMessage(response: any): TechnicalError {
  // findet in der technischen Fehlermeldung eine definierte Fehlermeldung beginnend mit 'EX_'
  // es wird angenommen, dass die technische Fehlermeldung in folgendem Format angeliefert wird: "EX_[n5]: This is the ErrorMessage"
  // Example:
  //
  //   "personResponseCode":
  //   "value": "INTERNER_FEHLER",
  //     "code": "7999",
  //     "textGerman": "Interner Fehler aufgetreten",
  //     "success": false
  //
  //   "error": "EX_10000:Illegal Evaluation Date"
  //
  const errorString = response?.error?.error;

  if (typeof errorString === 'string' && errorString.startsWith('EX_')) {
    const parts = errorString.split(':');
    return new TechnicalError(parts[0], parts[1]);
  }
  return new TechnicalError('EX_UNDEFINED', 'No Defined Message found');
}

export function findHttpErrorMessage(response: any): string | undefined {
  const match = response?.error?.match(/EX_\d{5}/);
  return match ? match[0] : undefined;
}
