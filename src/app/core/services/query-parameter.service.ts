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
  providedIn: 'root',
})
/* This service is responsible for providing the latest query parameters for the api (tenantId and viewOrganisationId)
* to all consumers. It is responsible to update these parameters when the active tenant or the active viewOrganisation changes. */
export class QueryParameterService {

  public activeQueryParams: Subject<QueryParams> = new ReplaySubject(1);
  public aViewOrganisationHasToBeChosen = false;

  constructor(private readonly authorizationService: AuthorizationService,
              private readonly organisationService: OrganisationService) {


    this.organisationService.activeViewOrganisation()
      .pipe(
        switchMap(org => fromPromise(this.authorizationService.getActiveTenant())
          .pipe(map(it => new QueryParams(it.id, org?.organisationCode))),
        ))
      .subscribe(queryParams => {

        this.aViewOrganisationHasToBeChosen = false;

        if (organisationService.viewOrganisationsCount()) {
          // Sind mehrere ViewOrganisations vorhanden, so muss eine gewählt werden
          // ansonsten wir auf einen Fehler laufen
          if (queryParams.viewOrganisationId) {
            this.activeQueryParams.next(queryParams);
          } else {
            this.aViewOrganisationHasToBeChosen = true;
          }
        } else {
          this.activeQueryParams.next(queryParams);
        }
      });
  }
}
