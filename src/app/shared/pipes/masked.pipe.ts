import { Pipe, PipeTransform } from '@angular/core';
import { MaskedValue } from '../../core/utils/types';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'masked',
  standalone: true,
})
export class MaskedPipe implements PipeTransform {
  private readonly maskedMessage: string;

  constructor(private readonly translate: TranslateService) {
    this.maskedMessage = this.translate.instant('general.masked');
  }

  transform<T>(value?: MaskedValue<T>, ...args: unknown[]): string {
    return value?.type !== 'Masked' ? (value?.value ? `${value.value}` : '-') : this.maskedMessage;
  }
}
