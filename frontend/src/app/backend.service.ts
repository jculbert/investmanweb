import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { DividendSummaryData } from './dividend-summary-report/dividend-summary-report.component'

@Injectable()
export class BackendService {

  constructor(private http: HttpClient) { }

  dividendSummaryReport() : Observable<DividendSummaryData[]> {
    return this.http.get<DividendSummaryData[]>('api/v1/dividends/?summary=true&startdate=20160701&enddate=20160930')
  }

}
