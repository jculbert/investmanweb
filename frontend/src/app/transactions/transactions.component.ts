import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {Location} from '@angular/common';

import {BackendService} from '../backend.service'


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  dataSource = new MatTableDataSource()
  account : string
  symbol : string

  constructor(
    private location: Location,
    private backendService: BackendService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.dataSource.data = [];

    this.account = this.route.snapshot.queryParams.account;
    this.symbol = this.route.snapshot.queryParams.symbol;
    this.backendService.transactions(this.account, this.symbol).subscribe(data => 
      {
        this.dataSource.data = data;
      }
    );
  }

  goback(){
    this.location.back();
  }
}

