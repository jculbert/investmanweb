import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {Location} from '@angular/common';

import {BackendService} from '../backend.service'


@Component({
  selector: 'app-holdings',
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.css']
})
export class HoldingsComponent implements OnInit {
  dataSource = new MatTableDataSource()
  account : string

  constructor(
    public location: Location,
    private backendService: BackendService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.dataSource.data = [];

    this.account = this.route.snapshot.paramMap.get('account');
    this.backendService.holdings(this.account).subscribe(data => 
      {
        this.dataSource.data = data;
      }
    );
  }

  goback(){
    this.location.back();
  }
}
