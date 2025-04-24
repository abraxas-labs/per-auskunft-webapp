import { Injectable } from '@angular/core';
import { map, ReplaySubject, Subject, switchMap, timer } from 'rxjs';
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
  public activeViewOrganisationId: string | undefined;

  constructor(private readonly authorizationService: AuthorizationService,
              private readonly organisationService: OrganisationService) {


    this.organisationService.activeViewOrganisation()
      .pipe(
        switchMap(org => fromPromise(this.authorizationService.getActiveTenant())
          .pipe(map(it => new QueryParams(it.id, org?.organisationCode))),
        ))
      .subscribe(queryParams => {

       if (!queryParams.viewOrganisationId && organisationService.viewOrganisationsCount() > 0){
         // Wenn keine viewOrganisationId vorhanden ist, es gibt aber mehr als 0 viewOrganisations,
         // so brechen wir hier ab, da wir ansonsten auf einen Fehler laufen.
         return;
       }

        // Wir müssen sicher sein, dass alle ViewOrganisations geladen sind
        // Sonst werden die Permissions geladen, ohne dass vorher die ViewOrganisations geladen wurden
        // Dann laufen wir auf einen Fehler
        const source = timer(1000);
        const subscribe = source.subscribe(() => {
          this.activeViewOrganisationId = queryParams.viewOrganisationId;
          this.activeQueryParams.next(queryParams);
          subscribe.unsubscribe();
        });
      });
  }
}
