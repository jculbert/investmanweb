import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {Location} from '@angular/common';

import {BackendService, TransactionData} from '../backend.service'

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  id : string
  transaction : TransactionData = undefined

  constructor(
    private location: Location,
    private backendService: BackendService,
    private route: ActivatedRoute

  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.backendService.get_transaction(this.id).subscribe(data => 
      {
        this.transaction = data;
      }
    );

  }

  onSave(event: {}) {
    this.backendService.put_transaction(this.id, this.transaction).subscribe(result =>
      {
        this.location.back();
      }
    );
  }    
}
