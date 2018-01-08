import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';

import {BackendService} from '../backend.service'

@Component({
  selector: 'app-dividend-summary-report',
  templateUrl: './dividend-summary-report.component.html',
  styleUrls: ['./dividend-summary-report.component.css']
})
export class DividendSummaryReportComponent implements OnInit {
  dataSource = new MatTableDataSource()
  startdate : Date
  enddate : Date
  startPickerControl : FormControl
  endPickerControl : FormControl
  total = 0
  ca_total = 0
  us_total = 0

  constructor(private backendService: BackendService) { }
  
  ngOnInit() {

    var now = new Date()
    this.startdate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    this.startPickerControl = new FormControl(this.startdate.toISOString())
    this.enddate = getthreeMonthEndDate(this.startdate)
    this.endPickerControl = new FormControl(this.enddate.toISOString())
  
    this.dataSource.data = [];
  }

  startDateChange(event: MatDatepickerInputEvent<Date>) {
    this.startdate = event.value;
    this.enddate = getthreeMonthEndDate(this.startdate)
    this.endPickerControl = new FormControl(this.enddate.toISOString());
  }

  endDateChange(event: MatDatepickerInputEvent<Date>) {
    this.enddate = event.value;
  }

  refreshClick() {
    this.backendService.dividendSummaryReport(this.startdate, this.enddate).subscribe(data => 
      {
        this.dataSource.data = data;

        this.total = 0;
        this.ca_total = 0;
        this.us_total = 0;
        data.forEach(item => 
          {
            this.total = this.total + item.amount
            if (item.us_amount != undefined) {
              this.us_total = this.us_total + item.us_amount
            } else {
              this.ca_total = this.ca_total + item.amount
            }
          });
      })
  }
}

export interface DividendSummaryData {
  symbol: string;
  amount: number;
  us_amount: number;
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

function lastDayOfMonth(year : number, month: number ): number {
  return new Date(year, month+1, 0).getDate() // Gives last day of the month
}

function getthreeMonthEndDate(startdate : Date) : Date {
  var year = startdate.getFullYear()
  var month = startdate.getMonth() + 2
  if (month > 12) {
    year = year + 1
    month = month % 12
  }
  var day = lastDayOfMonth(year, month)
  return new Date(year, month, day)
}