import { enableProdMode, ErrorHandler, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { GlobalErrorHandler } from './app/shared/services/global-error-handler';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpTokenInterceptor } from './app/core/interceptor/http-token.interceptor';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { APP_BASE_HREF, PlatformLocation, DatePipe, CommonModule } from '@angular/common';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { AppHeaderBarIamModule, AuthenticationModule, AuthorizationModule, UserModule, DialogModule, RadioButtonModule, DateModule, AlertBarModule, ButtonModule, DropdownModule } from '@abraxas/base-components';
import { WebpackTranslateLoader } from './app/core/utils/webpack-translate-loader';
import { PersonDetailModule } from './app/features/person-detail/person-detail.module';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
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
      PersonDetailModule,
      DialogModule,
      RadioButtonModule,
      DateModule,
      MatDialogModule,
      AlertBarModule,
      ButtonModule,
      CommonModule,
      DropdownModule
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: appInitializerFactory, deps: [TranslateService], multi: true },
    { provide: APP_BASE_HREF, useFactory: getBaseHref, deps: [PlatformLocation] },
    DatePipe,
    provideAnimations()
  ]
}).catch((err) => console.error(err));

/**
 * Mit dieser Factory werden die Übersetzungen beim Start der Applikation geladen.
 * So kann sichergestellt werden, dass beim Aufruf der Methode instant() des TranslateService wirklich
 * in jedem Fall Übersetzungen geliefert werden.
 * Für mehr Infromationen siehe auch:
 * https://mcvendrell.medium.com/configuring-ngx-translate-to-load-at-startup-in-angular-1995e7dd6fcc
 */
function appInitializerFactory(translate: TranslateService) {
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
function getBaseHref(platformLocation: PlatformLocation): string {
  return platformLocation.getBaseHrefFromDOM();
}
