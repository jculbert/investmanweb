import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

export interface SymbolDividendData {
  date: string;
  amount: number;
  account: string;
}

export interface SymbolDividendReportData {
  growth: number;
  yeeld: number;
  dividends: SymbolDividendData[];
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
  fee: number;
  capital_return: number;
  capital_gain: number;
  acb: number;
  account: string;
  symbol: string;
  note: string;
}

export interface SymbolData {
  name: string;
  description: string;
  last_price: number;
  last_price_data: string;
}

export class Transaction implements TransactionData {
  id: number;
  date: string;
  type: string;
  quantity: number;
  price: number;
  amount: number;
  fee: number;
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

export interface UploadData {
  id: number;
  date: string;
  num_transactions: number;
  result: string;
  content: string
}


@Injectable()
export class BackendService {

  constructor(private http: HttpClient) { }

  dividendSummaryReport(startdate: Date, enddate: Date) : Observable<DividendSummaryData[]> {
    let params = new HttpParams().append('summary', 'true')
    params = params.append('startdate', new DatePipe('en-US').transform(startdate, 'yyyyMMdd'))
    params = params.append('enddate', new DatePipe('en-US').transform(enddate, 'yyyyMMdd'))
    return this.http.get<DividendSummaryData[]>('/investmanbackend/api/v1/dividends/', {params: params})
  }

  symbolDividendReport(symbol: string) : Observable<SymbolDividendReportData> {
    let params = new HttpParams().append("symbol", symbol)
    return this.http.get<SymbolDividendReportData>('/investmanbackend/api/v1/dividends/', {params: params})
  }

  accounts() : Observable<AccountData[]> {
    return this.http.get<AccountData[]>('/investmanbackend/api/v1/accounts/')
  }

  holdings(account: string) : Observable<HoldingData[]> {
    return this.http.get<HoldingData[]>('/investmanbackend/api/v1/holdings/?account=' + account)
  }

  transactions(account: string, symbol: string) : Observable<TransactionData[]> {
    return this.http.get<TransactionData[]>('/investmanbackend/api/v1/transactions/?account=' + account + '&symbol=' + symbol)
  }

  symbols() : Observable<SymbolData[]> {
    return this.http.get<SymbolData[]>('/investmanbackend/api/v1/symbols/')
  }

  transactions_uploaded(upload_id: string) : Observable<TransactionData[]> {
    return this.http.get<TransactionData[]>('/investmanbackend/api/v1/transactions/?upload_id=' + upload_id)
  }

  get_transaction(id: string) : Observable<TransactionData> {
    return this.http.get<TransactionData>('/investmanbackend/api/v1/transactions/' + id + '/')
  }

  put_transaction(id: string, transaction: TransactionData) : Observable<TransactionData> {
    return this.http.put<TransactionData>('/investmanbackend/api/v1/transactions/' + id + '/', transaction)
  }

  add_transaction(transaction: TransactionData) : Observable<TransactionData> {
    return this.http.post<TransactionData>('/investmanbackend/api/v1/transactions/', transaction)
  }

  delete_transaction(id: string) : Observable<any> {
    return this.http.delete<any>('/investmanbackend/api/v1/transactions/' + id + '/')
  }

  get_symbol(name: string) : Observable<SymbolData> {
    return this.http.get<SymbolData>('/investmanbackend/api/v1/symbols/' + name + '/')
  }

  put_symbol(name: string, symbol: SymbolData) : Observable<SymbolData> {
    return this.http.put<SymbolData>('/investmanbackend/api/v1/symbols/' + name + '/', symbol)
  }

  upload_file(file: any): Observable<UploadData[]> {

    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<UploadData[]>('/investmanbackend/api/v1/uploads/', formData);
  }
}
