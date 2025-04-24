import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExtendedSearchDTO, FullTextSearchAttributes, SearchResult } from '../models/models';
import { QueryParameterService, QueryParams } from '../../../core/services/query-parameter.service';

@Injectable({
  providedIn: 'root',
})
export class PersonSearchService {

  constructor(
    private readonly httpClient: HttpClient,
    private readonly queryParamService: QueryParameterService) {
  }

  public searchPersonExtended(searchObj: ExtendedSearchDTO): Observable<SearchResult> {
    return this.queryParamService.activeQueryParams
      .pipe(switchMap((params) => this.doSearchPersonExtended(searchObj, params)));
  }

  private doSearchPersonExtended(searchObj: ExtendedSearchDTO, params: QueryParams): Observable<SearchResult> {
    const url = `${environment.apiBaseUrl}/auskunft/natPerson/extendedSearch`;
    return this.httpClient.post<SearchResult>(url, searchObj, {params: params.toHttpParams()});
  }

  public fullTextSearchPerson(searchObj: FullTextSearchAttributes): Observable<SearchResult> {
    return this.queryParamService.activeQueryParams.pipe(
      switchMap((params) => this.doFullTextSearchPerson(searchObj, params))
    );
  }

  private doFullTextSearchPerson(searchObj: FullTextSearchAttributes, params: QueryParams): Observable<SearchResult> {
    const url = `${environment.apiBaseUrl}/auskunft/natPerson/fullTextSearch`;
    return this.httpClient.post<SearchResult>(url, searchObj, {params: params.toHttpParams()});
  }

  public getManual(): Observable<string> {
    const url = `${environment.apiBaseUrl}/auskunft/manual`;
    return this.httpClient.get<string>(url);
  }
}
