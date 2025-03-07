import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthorizationService } from '@abraxas/base-components';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly authorizationService: AuthorizationService) {
  }

  public loadManual(): Observable<string> {
    return from(this.authorizationService.getActiveTenant())
      .pipe(switchMap((tenant) => this.getManual(tenant.id)));

  }

  private getManual(tenantId: string): Observable<string> {
    const url = `${environment.apiBaseUrl}/auskunft/manual?tenantId=${tenantId}`;
    return this.httpClient.get(url, { responseType: 'text' }) as Observable<string>;
  }
}
