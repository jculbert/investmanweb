import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';

import {BackendService} from '../backend.service'

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  dataSource = new MatTableDataSource()

  constructor(private backendService: BackendService) { }

  ngOnInit() {
    this.dataSource.data = [];

    this.backendService.accounts().subscribe(data => 
      {
        this.dataSource.data = data;
      }
    );
  }
}

