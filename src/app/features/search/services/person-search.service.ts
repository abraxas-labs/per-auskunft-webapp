import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthorizationService } from '@abraxas/base-components';
import { from, Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {FullTextSearchAttributes, SearchAttributes, SearchResult} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class PersonSearchService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly authorizationService: AuthorizationService
  ) {}

  public searchPerson(searchObj: SearchAttributes): Observable<SearchResult> {
    return from(this.authorizationService.getActiveTenant()).pipe(
      switchMap((tenant) => this.doSearchPerson(searchObj, tenant.id))
    );
  }

  private doSearchPerson(searchObj: SearchAttributes, tenantId: string): Observable<SearchResult> {
    const url = `${environment.apiBaseUrl}/auskunft/natPerson/search?tenantId=${tenantId}`;
    return this.httpClient.post<SearchResult>(url, searchObj);
  }

  public fullTextSearchPerson(searchObj: FullTextSearchAttributes): Observable<SearchResult> {
    return from(this.authorizationService.getActiveTenant()).pipe(
      switchMap((tenant) => this.doFullTextSearchPerson(searchObj, tenant.id))
    );
  }

  private doFullTextSearchPerson(searchObj: FullTextSearchAttributes, tenantId: string): Observable<SearchResult> {
    const url = `${environment.apiBaseUrl}/auskunft/natPerson/fullTextSearch?tenantId=${tenantId}`;
    return this.httpClient.post<SearchResult>(url, searchObj);
  }

}
