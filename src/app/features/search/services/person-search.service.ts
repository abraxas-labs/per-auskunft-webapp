import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {FullTextSearchAttributes, SearchAttributes, SearchResult} from '../models/models';
import { QueryParameterService, QueryParams } from '../../../core/services/query-parameter.service';

@Injectable({
  providedIn: 'root',
})
export class PersonSearchService {

  constructor(
    private readonly httpClient: HttpClient,
    private readonly queryParamService: QueryParameterService) {
  }

  public searchPerson(searchObj: SearchAttributes): Observable<SearchResult> {
    return this.queryParamService.activeQueryParams
      .pipe(switchMap((params) => this.doSearchPerson(searchObj, params)));
  }

  private doSearchPerson(searchObj: SearchAttributes, params: QueryParams): Observable<SearchResult> {
    const url = `${environment.apiBaseUrl}/auskunft/natPerson/search`;
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

}
