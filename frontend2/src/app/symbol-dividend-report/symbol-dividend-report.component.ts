import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {Location} from '@angular/common';

import {BackendService, SymbolData} from '../backend.service'
import { LineChartService} from '../line-chart//line-chart-service';

@Component({
  selector: 'app-symbol-dividend-report',
  templateUrl: './symbol-dividend-report.component.html',
  styleUrls: ['./symbol-dividend-report.component.css'],
  providers: [LineChartService]
})
export class SymbolDividendReportComponent implements OnInit {
  symbol : SymbolData;
  growths : number[];
  yield : number;
  dataSource = new MatTableDataSource();
  @Output() dividendReportClosed = new EventEmitter<boolean>();

  constructor(
    private backendService: BackendService,
    public location: Location,
    public lineChartService: LineChartService
    )
  { }
  
  ngOnInit() {
  }

  setSymbol(symbol: SymbolData) {
    this.symbol = symbol;
    this.dataSource.data = [];

    this.backendService.symbolDividendReport(this.symbol.name).subscribe(data => 
      {
        this.growths = data.growths;
        this.yield = data.yeeld;
        this.lineChartService.data = new Array();
        var lastDate = undefined;
        for (let i = 0; i < data.dividends.length; i++) {
          let date = data.dividends[i].date;
          if (date != lastDate) { // Ignore duplicate dividends - caused by stock held in multiple accounts
              lastDate = date;
              this.lineChartService.data.push({t: new Date(date), y: data.dividends[i].amount})
          }
        }
        this.dataSource.data = data.dividends;
      }
    );
  }

  close() {
    this.dividendReportClosed.emit(true);
  }
}
