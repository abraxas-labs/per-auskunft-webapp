
import {Injectable} from '@angular/core';
import {from, map, Observable, switchMap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {AuthorizationService} from "@abraxas/base-components";

export type Permission = {
  accessToInactiveResidents: boolean;
  historicValues: boolean;
  searchExport: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(
      private readonly httpClient: HttpClient,
      private readonly authorizationService: AuthorizationService
  ) {
  }

  public loadPermission(): Observable<Permission> {
    return from(this.authorizationService.getActiveTenant()).pipe(
        switchMap((tenant) => this.doLoadPermission(tenant.id))
    );
  }

  private doLoadPermission(tenantId: string): Observable<Permission> {
    const url = `${environment.apiBaseUrl}/auskunft/permission?tenantId=${tenantId}`;
    return this.httpClient.get<Permission>(url);
  }

}
