import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  Observable, ReplaySubject, Subject,
  switchMap,
} from 'rxjs';
import { AuthenticationService, AuthorizationService, Tenant } from '@abraxas/base-components';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type Organisation = {
  organisationCode: string;
  secureConnectId: string;
  organisationName: string;
  organisationTypeCode: string;
  groupOrganisations: string[];
};

export type ActiveAndOtherTenants = {
  activeTenant: Tenant;
  userTenants: Tenant[];
};

const LOCAL_STORAGE_KEY = 'activeViewOrganisationId';

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {

  // Visible Organisations are all the organisations, that the user knows about with his active tenant
  private _visibleOrganisations: Subject<Organisation[]> = new ReplaySubject<Organisation[]>(1);
  private _activeViewOrganisationId: BehaviorSubject<string | undefined>;
  private _viewOrganisationIds: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  // viewOrganisations are organisation that the user has roles in the new role format (organisationId~rolename)
  private readonly _viewOrganisations: Observable<Organisation[]>;
  // the active viewOrganisation is the organisation on behalf the user intents to perform actions.
  private readonly _activeViewOrganisation: Subject<Organisation | undefined> = new ReplaySubject(1);
  // the possible reporting municipalities, are all the organisation withing the active viewOrganisation
  private _reportingMunicipalities: Subject<Organisation[]> = new ReplaySubject(1);

  constructor(private readonly httpClient: HttpClient,
              private readonly authorizationService: AuthorizationService,
              private readonly authenticationService: AuthenticationService) {

    merge(
      // We need to reload if the user logs in or changes its tenant
      this.authenticationService.authenticationChanged.pipe(filter((authenticated) => authenticated)),
      this.authorizationService.activeTenantChanged,
    ).subscribe(() => this.loadViewOrganisations());

    let id = localStorage.getItem(LOCAL_STORAGE_KEY) ?? undefined;
    this._activeViewOrganisationId = new BehaviorSubject<string | undefined>(id);

    this._viewOrganisations = combineLatest([this._visibleOrganisations.asObservable(), this._viewOrganisationIds.asObservable()])
      .pipe(map(([organisations, ids]) => organisations.filter(it => ids.includes(it.organisationCode))));

    combineLatest([this._viewOrganisations, this._activeViewOrganisationId.asObservable()])
      .pipe(
        map(([orgs, id]) => {
          // Note that we do the following: If the id of the active viewOrganisation is defined we first try to
          // find the corresponding organisation. If either no id is present or we cannot find the organisation,
          // we return the first viewOrganisation if one exists.
          let res = id && orgs.find(it => it.organisationCode === id);
          if (!res) {
            res = orgs.length > 0 ? orgs[0] : undefined;
          }
          return res;
        }),
        // Sometimes same value was emitted multiple times. This now prevents this.
        distinctUntilChanged((previous, current) => previous?.organisationCode === current?.organisationCode)
      )
      .subscribe(this._activeViewOrganisation);

    combineLatest([this._activeViewOrganisation, this._visibleOrganisations.asObservable()])
      .pipe(
        map(([activeViewOrganisation, visibleOrgs]) => {
          if(!activeViewOrganisation) {
            return visibleOrgs;
          }
          return [activeViewOrganisation,
            ...visibleOrgs.filter(org => activeViewOrganisation.groupOrganisations.includes(org.organisationCode))]
        })
      )
      .subscribe(this._reportingMunicipalities)
  }

  public viewOrganisations(): Observable<Organisation[]> {
    return this._viewOrganisations;
  }

  public activeViewOrganisation(): Observable<Organisation | undefined> {
    return this._activeViewOrganisation;
  }

  public reportingMunicipalities(): Observable<Organisation[]> {
    return this._reportingMunicipalities.asObservable();
  }

  public setActiveViewOrganisationId(organisationCode?: string) {

    if (organisationCode) {
      localStorage.setItem(LOCAL_STORAGE_KEY, organisationCode);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    this._activeViewOrganisationId.next(organisationCode);
  }

  public loadViewOrganisations() {
    this.loadVisibleOrganisations();
    from(this.authorizationService.getActiveTenant())
      .pipe(switchMap((tenant) => this.doLoadViewOrganisationIds(tenant.id)))
      .subscribe(response => this._viewOrganisationIds.next(response));
  }

  private doLoadViewOrganisationIds(tenantId: string): Observable<string[]> {
    const url = `${environment.apiBaseUrl}/auskunft/viewOrganisationIds?tenantId=${tenantId}`;
    return this.httpClient.get<string[]>(url);
  }

  private loadVisibleOrganisations() {
    from(this.authorizationService.getActiveTenant())
      .pipe(
        switchMap((tenant) => this.doLoadVisibleOrganisations(tenant.id)),
      )
      .subscribe(response => this._visibleOrganisations.next(response));
  }

  private doLoadVisibleOrganisations(tenantId: string): Observable<Organisation[]> {
    const url = `${environment.apiBaseUrl}/auskunft/organisations?tenantId=${tenantId}`;
    return this.httpClient.get<Organisation[]>(url);
  }
}
