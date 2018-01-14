import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatTableDataSource} from '@angular/material';
import {FormControl} from '@angular/forms';

import {BackendService} from '../backend.service'

@Component({
  templateUrl: './account-holding.component.html'
})
export class AccountHoldingComponent implements OnInit {

  constructor(private backendService: BackendService) { }

  ngOnInit() {
  }
}

