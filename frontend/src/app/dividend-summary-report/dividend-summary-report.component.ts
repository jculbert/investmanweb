import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';

import {BackendService} from '../backend.service'

@Component({
  selector: 'app-dividend-summary-report',
  templateUrl: './dividend-summary-report.component.html',
  styleUrls: ['./dividend-summary-report.component.css']
})
export class DividendSummaryReportComponent implements OnInit {
  dataSource : ThisDataSource;

  constructor(private backendService: BackendService) { }
  
  ngOnInit() {
    this.dataSource = new ThisDataSource(this.backendService)
  }
}

export interface DividendSummaryData {
  symbol: string;
  amount: number;
}

export class ThisDataSource extends DataSource<any> {
  constructor(private backendService: BackendService) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DividendSummaryData[]> {
    return this.backendService.dividendSummaryReport()
  }

  disconnect() {}
}