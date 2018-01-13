import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';

export interface AccountData {
  name: string;
  currency: string;
}

export interface DividendSummaryData {
  symbol: string;
  amount: number;
  us_amount: number;
}

@Injectable()
export class BackendService {

  constructor(private http: HttpClient) { }

  dividendSummaryReport(startdate: Date, enddate: Date) : Observable<DividendSummaryData[]> {
    var start = new DatePipe('en-US').transform(startdate, 'yyyyMMdd');
    var end = new DatePipe('en-US').transform(enddate, 'yyyyMMdd');
    return this.http.get<DividendSummaryData[]>('api/v1/dividends/?summary=true&startdate=' + start + '&enddate=' + end)
  }

  accounts() : Observable<AccountData[]> {
    return this.http.get<AccountData[]>('api/v1/accounts/')
  }
}
