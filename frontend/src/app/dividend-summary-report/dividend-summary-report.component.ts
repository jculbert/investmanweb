import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatTableDataSource} from '@angular/material';

import {BackendService} from '../backend.service'

@Component({
  selector: 'app-dividend-summary-report',
  templateUrl: './dividend-summary-report.component.html',
  styleUrls: ['./dividend-summary-report.component.css']
})
export class DividendSummaryReportComponent implements OnInit {
  dataSource = new MatTableDataSource();
  startdate: Date;
  enddate: Date;
  total = 0

  constructor(private backendService: BackendService) { }
  
  ngOnInit() {
    //this.dataSource = new ThisDataSource(this.backendService)
    this.dataSource.data = [];
  }

  startDateChange(event: MatDatepickerInputEvent<Date>) {
    this.startdate = event.value;
  }

  endDateChange(event: MatDatepickerInputEvent<Date>) {
    this.enddate = event.value;
  }

  refreshClick() {
    this.backendService.dividendSummaryReport(this.startdate, this.enddate).subscribe(data => 
      {
        this.dataSource.data = data;

        this.total = 0;
        data.forEach(item => this.total = this.total + item.amount)
      })
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
    return this.backendService.dividendSummaryReport(undefined, undefined)
  }

  disconnect() {}
}