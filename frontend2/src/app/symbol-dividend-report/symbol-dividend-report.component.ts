import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {MatTableDataSource} from '@angular/material';
import {Location} from '@angular/common';

import {BackendService} from '../backend.service'

@Component({
  selector: 'app-symbol-dividend-report',
  templateUrl: './symbol-dividend-report.component.html',
  styleUrls: ['./symbol-dividend-report.component.css']
})
export class SymbolDividendReportComponent implements OnInit {
  name : string
  growth : number
  yield : number
  dataSource = new MatTableDataSource()

  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute,
    public location: Location
    )
  { }
  
  ngOnInit() {
    this.dataSource.data = [];

    this.name = this.route.snapshot.paramMap.get('name');
    this.backendService.symbolDividendReport(this.name).subscribe(data => 
      {
        this.growth = data.growth
        this.yield = data.yeeld
        this.dataSource.data = data.dividends;
      }
    );
  }
}
