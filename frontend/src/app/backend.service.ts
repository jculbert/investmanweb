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

export interface HoldingData {
  symbol: string;
  quantity: number;
  amount: number;
}

export interface TransactionData {
  id: number;
  date: string;
  type: string;
  quantity: number;
  price: number;
  amount: number;
  capital_return: number;
  capital_gain: number;
  acb: number;
  account: string;
  symbol: string;
  note: string;
}

export class Transaction implements TransactionData {
  id: number;
  date: string;
  type: string;
  quantity: number;
  price: number;
  amount: number;
  capital_return: number;
  capital_gain: number;
  acb: number;
  note: string;

  constructor(public account: string, public symbol: string) {
    this.date = '2030-12-30';
    this.type = 'DIST_D';
    this.quantity = 0;
    this.price = 0;
    this.amount = 0;
  }
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

  holdings(account: string) : Observable<HoldingData[]> {
    return this.http.get<HoldingData[]>('api/v1/holdings?account=' + account)
  }

  transactions(account: string, symbol: string) : Observable<TransactionData[]> {
    return this.http.get<TransactionData[]>('api/v1/transactions?account=' + account + '&symbol=' + symbol)
  }

  get_transaction(id: string) : Observable<TransactionData> {
    return this.http.get<TransactionData>('api/v1/transactions/' + id + '/')
  }

  put_transaction(id: string, transaction: TransactionData) : Observable<TransactionData> {
    return this.http.put<TransactionData>('api/v1/transactions/' + id + '/', transaction)
  }

  add_transaction(transaction: TransactionData) : Observable<TransactionData> {
    return this.http.post<TransactionData>('api/v1/transactions/', transaction)
  }

  delete_transaction(id: string) : Observable<any> {
    return this.http.delete<any>('api/v1/transactions/' + id + '/')
  }
}
