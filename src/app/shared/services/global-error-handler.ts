import { TranslateService } from '@ngx-translate/core';
import { AlertBarService } from '@abraxas/base-components';
import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { findHttpErrorMessage, findTechnicalErrorMessage, TechnicalError } from '../../core/utils/commons';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler extends ErrorHandler {
  constructor(private readonly alertService: AlertBarService,
              private readonly translate: TranslateService,
              private zone: NgZone) {
    super();
  }

  override handleError(error: any) {

    let message = error;
    if(error instanceof TechnicalError) {
      message = this.translate.instant('general.errorCodes.' + error.message);
    } else if(error instanceof HttpErrorResponse) {
      if(error.status >= 500) {
        const httpErrorMessage = findHttpErrorMessage(error);
        message = httpErrorMessage ?
          this.translate.instant('general.errorCodes.' + httpErrorMessage) :
          this.translate.instant('general.httpErrorCodes.500');
      } else if(error.status >= 400) {
        message = this.translate.instant('general.httpErrorCodes.400')
      } else {
        message = this.translate.instant('general.httpErrorCodes.fallback')
      }
    } else if(error.message) {
      message = this.translate.instant(error.message);
    }
    this.alertService.error(message);
    super.handleError(error);
    // This hack is needed to ensure, that Angular renders the error message.
    // Why a call to alertService is not enough, is beyond me.
    // For more info see: https://v17.angular.io/api/core/NgZone#run
    // Or Stackoverflow: https://stackoverflow.com/a/35106069
    this.zone.run(() => {});
  }
}
