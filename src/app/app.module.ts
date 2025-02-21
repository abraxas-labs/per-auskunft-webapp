import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { APP_BASE_HREF, CommonModule, DatePipe, PlatformLocation } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  AlertBarModule,
  AppHeaderBarIamModule,
  AuthenticationModule,
  AuthorizationModule,
  ButtonModule,
  DateModule,
  DialogModule, DropdownModule,
  RadioButtonModule,
  UserModule,
} from '@abraxas/base-components';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpTokenInterceptor } from './core/interceptor/http-token.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { WebpackTranslateLoader } from './core/utils/webpack-translate-loader';
import { firstValueFrom } from 'rxjs';
import { SearchModuleGeneral } from './features/search/search.module';
import { PersonDetailModule } from './features/person-detail/person-detail.module';
import { HistorySelectorComponent } from './features/common/components/history-selector/history-selector.component';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalErrorHandler } from './shared/services/global-error-handler';

/**
 * Mit dieser Factory werden die Übersetzungen beim Start der Applikation geladen.
 * So kann sichergestellt werden, dass beim Aufruf der Methode instant() des TranslateService wirklich
 * in jedem Fall Übersetzungen geliefert werden.
 * Für mehr Infromationen siehe auch:
 * https://mcvendrell.medium.com/configuring-ngx-translate-to-load-at-startup-in-angular-1995e7dd6fcc
 */
export function appInitializerFactory(translate: TranslateService) {
  return () => {
    return firstValueFrom(translate.use(translate.getDefaultLang()));
  };
}

/**
 * This function is copied from this Stackoverflow Answer:
 * https://stackoverflow.com/questions/39287444/angular2-how-to-get-app-base-href-programmatically
 * This function is used internal to get a string instance of the `<base href="" />` value from `index.html`.
 * This is an exported function, instead of a private function or inline lambda, to prevent this error:
 *
 * `Error encountered resolving symbol values statically.`
 * `Function calls are not supported.`
 * `Consider replacing the function or lambda with a reference to an exported function.`
 *
 * @param platformLocation an Angular service used to interact with a browser's URL
 * @return a string instance of the `<base href="" />` value from `index.html`
 */
export function getBaseHref(platformLocation: PlatformLocation): string {
  return platformLocation.getBaseHrefFromDOM();
}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    HistorySelectorComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppHeaderBarIamModule,
    AuthenticationModule.forAuthentication(environment.authenticationConfig),
    AuthorizationModule.forAuthorization(environment.authorizationConfig),
    UserModule.forRoot(environment.userConfig),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: WebpackTranslateLoader,
      },
      defaultLanguage: 'de',
      useDefaultLang: true,
      isolate: false,
    }),
    BrowserAnimationsModule,
    SearchModuleGeneral,
    PersonDetailModule,
    DialogModule,
    RadioButtonModule,
    DateModule,
    MatDialogModule,
    AlertBarModule,
    ButtonModule,
    CommonModule,
    DropdownModule,
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: appInitializerFactory, deps: [TranslateService], multi: true },
    { provide: APP_BASE_HREF, useFactory: getBaseHref, deps: [PlatformLocation] },
    DatePipe,
  ],
})
export class AppModule {
}
