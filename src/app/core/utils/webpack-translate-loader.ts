import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

export class WebpackTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<any> {
    return from(import('../../../assets/i18n/' + lang + '.json'));
  }
}
