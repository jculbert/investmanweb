import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {MatTableDataSource} from '@angular/material';
import {Location} from '@angular/common';

import {BackendService} from '../backend.service'
import { LineChartService} from '../line-chart//line-chart-service';

@Component({
  selector: 'app-symbol-dividend-report',
  templateUrl: './symbol-dividend-report.component.html',
  styleUrls: ['./symbol-dividend-report.component.css'],
  providers: [LineChartService]
})
export class SymbolDividendReportComponent implements OnInit {
  name : string
  growths : number[]
  yield : number
  dataSource = new MatTableDataSource()

  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute,
    public location: Location,
    public lineChartService: LineChartService
    )
  { }
  
  ngOnInit() {
    this.dataSource.data = [];

    this.name = this.route.snapshot.paramMap.get('name');
    this.backendService.symbolDividendReport(this.name).subscribe(data => 
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
}
