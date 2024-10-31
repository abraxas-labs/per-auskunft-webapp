import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  private readonly key = `urn:abraxas:${environment.authenticationConfig.clientId}:access_token`;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let accessToken = sessionStorage.getItem(this.key)?.replace(/"/g, '');

    return next.handle(
      req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken,
        },
      })
    );
  }
}
