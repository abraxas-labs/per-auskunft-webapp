import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, switchMap } from 'rxjs';
import { AuthorizationService, Tenant } from '@abraxas/base-components';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type Organisation = {
  organisationCode: string;
  secureConnectId: string;
  organisationName: string;
  organisationTypeCode: string;
};

export type ActiveAndOtherTenants = {
  activeTenant: Tenant;
  userTenants: Tenant[];
};

@Injectable({
  providedIn: 'root',
})
export class CustomTenantService {
  private _visibleOrganisations: BehaviorSubject<Organisation[]> = new BehaviorSubject<Organisation[]>([]);

  constructor(private readonly httpClient: HttpClient,
              private readonly authorizationService: AuthorizationService) {
  }

  public visibleOrganisations(): Observable<Organisation[]> {
    return this._visibleOrganisations.asObservable();
  }

  public loadVisibleOrgansiations() {
    from(this.authorizationService.getActiveTenant())
      .pipe(
        switchMap((tenant) => this.doLoadVisibleOrganisations(tenant.id)),
      )
      .subscribe(response => this._visibleOrganisations.next(response));
  }

  private doLoadVisibleOrganisations(tenantId: string): Observable<Organisation[]> {
    const url = `${environment.apiBaseUrl}/auskunft/tenants?tenantId=${tenantId}`;
    return this.httpClient.get<Organisation[]>(url).pipe(map(it => it));
  }
}
