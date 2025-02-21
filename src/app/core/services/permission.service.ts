import { Injectable } from '@angular/core';
import { from, Observable, ReplaySubject, Subject, switchMap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthorizationService } from '@abraxas/base-components';
import { OrganisationService } from './organisation.service';
import { QueryParameterService, QueryParams } from './query-parameter.service';

export type Permission = {
  accessToInactiveResidents: boolean;
  historicValues: boolean;
  searchExport: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  private _permissions: Subject<Permission> = new ReplaySubject<Permission>(1);

  constructor(
    private readonly httpClient: HttpClient,
    private readonly queryParamService: QueryParameterService) {
    this.queryParamService.activeQueryParams
      .pipe(switchMap(params => this.doLoadPermission(params)))
      .subscribe(this._permissions);
  }

  public permission(): Observable<Permission> {
    return this._permissions.asObservable();
  }

  private doLoadPermission(params: QueryParams): Observable<Permission> {
    const url = `${environment.apiBaseUrl}/auskunft/permission`;
    return this.httpClient.get<Permission>(url, { params: params.toHttpParams() });
  }

}
