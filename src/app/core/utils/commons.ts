import {MaskedValue} from './types';
import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";
import * as moment from "moment/moment";
import {HistorySearchType} from "../../features/common/components/history-selector/history-selector.component";

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
      return 'transgender';
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

export const wildcardPositionValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (typeof control.value !== 'string') {
    return null;
  }

  const searchWordsArray = control.value?.trim().split(" ");
  for (const singleWord of searchWordsArray) {

    let countStars = singleWord?.split('*').length -1;
    if (countStars > 1){
      return {message: 'Only one star wildcard (*) per search allowed'};
    }
    if (singleWord?.startsWith('*')){
      return {message: 'No star (*) wildcard allowed at start of search term'};
    }
  }

  if (control.value?.match('(?:\\?\\*)')) {
    return {message: 'No Star after question mark'};
  }

  return null;
};

export const atLeastTwoCharacterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (typeof control.value !== 'string' || !control.value) {
      return null;
  }

  const withoutWildcards =  control.value?.trim().replace('*','').replace('?','');
  if (withoutWildcards.length < 2){
    return {message: 'At least 2 characters in a search string'};
  }

  const searchWordsArray = control.value?.trim().split(" ");
  for (const singleWord of searchWordsArray) {
    if (singleWord?.trim().includes('*') || singleWord?.trim().includes('?')){
      const stringWithoutWildcards =  singleWord?.trim().replace('*','').replace('?','');
      if (stringWithoutWildcards.length < 2){
        return {message: 'At least 2 characters in a search string'};
      }
    }
  }

  return null;
}

export function getTodayAsUTCString(): string {
  return getEvalDateAsUTCString(new Date());
}

export function getEvalDateAsUTCString(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

export function getValidFromAsUTCString(date: Date, historySearchType: any): string {
  if (historySearchType === HistorySearchType.QUALIFYING_DATE) {
    return getEvalDateAsUTCString(date);
  }
  return getTodayAsUTCString();
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
    super(message)
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

  if(typeof errorString === 'string' && errorString.startsWith("EX_")) {
    const parts = errorString.split(":");
    return new TechnicalError(parts[0], parts[1]);
  }
  return new TechnicalError("EX_UNDEFINED", "No Defined Message found");
}

export function findHttpErrorMessage(response: any): string | undefined {
  const match = response?.error?.match(/EX_\d{5}/);
  return match ? match[0] : undefined;
}
