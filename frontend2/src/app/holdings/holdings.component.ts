import { Component, OnInit, ViewChild } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {Location} from '@angular/common';

import {BackendService} from '../backend.service'
import { SymbolComponent } from '../symbol/symbol.component';

@Component({
  selector: 'app-holdings',
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.css']
})
export class HoldingsComponent implements OnInit {
  dataSource = new MatTableDataSource()
  account : string
  symbol: string = null
  @ViewChild(SymbolComponent, {static: false})
  private symbolComponent: SymbolComponent;

  constructor(
    public location: Location,
    private backendService: BackendService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.dataSource.data = [];

    this.route.params.subscribe(
      params => {
        this.dataSource.data = [];
        this.account = params['account'];
        this.backendService.holdings(this.account).subscribe(data => 
          {
            this.dataSource.data = data;
          }
        );
      }
    );
  }

  setSymbol(symbol) {
    this.symbol = symbol;
    this.symbolComponent.setSymbol(symbol);
  }

  onSymbolClosed(closed: boolean) {
    this.symbol = null
  }

  goback(){
    this.location.back();
  }
}
