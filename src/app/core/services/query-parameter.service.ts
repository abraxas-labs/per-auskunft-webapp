import { Injectable } from '@angular/core';
import { map, ReplaySubject, Subject, switchMap } from 'rxjs';
import { AuthorizationService } from '@abraxas/base-components';
import { OrganisationService } from './organisation.service';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { HttpParams } from '@angular/common/http';

export class QueryParams {

  constructor(public readonly tenantId: string,
              public readonly viewOrganisationId?: string) {
  }


  public toHttpParams(): HttpParams {
    let httpParams = new HttpParams().set('tenantId', this.tenantId);
    if (this.viewOrganisationId) {
      httpParams = httpParams.set('viewOrganisationId', this.viewOrganisationId);
    }
    return httpParams;
  }
}

@Injectable({
  providedIn: 'root'
})
/* This service is responsible for providing the latest query parameters for the api (tenantId and viewOrganisationId)
* to all consumers. It is responsible to update these parameters when the active tenant or the active viewOrganisation changes. */
export class QueryParameterService {

  public activeQueryParams: Subject<QueryParams> = new ReplaySubject(1);

  constructor(private readonly authorizationService: AuthorizationService,
              private readonly organisationService: OrganisationService) {

    this.organisationService.activeViewOrganisation()
      .pipe(
        switchMap(org => fromPromise(this.authorizationService.getActiveTenant())
          .pipe(map(it => new QueryParams(it.id, org?.organisationCode)))
      ))
      .subscribe(this.activeQueryParams);
  }
}
