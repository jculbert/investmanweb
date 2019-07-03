import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    public location: Location,
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

  static notSet(value: any) {
    return value == undefined || value == null;
  }

  onSave(event: {}) {
    // Fill in values not set
    if (TransactionComponent.notSet(this.transaction.fee)) {
      this.transaction.fee = 0.00
    }
    if (TransactionComponent.notSet(this.transaction.quantity)) {
      this.transaction.quantity = 0
    }
    if (TransactionComponent.notSet(this.transaction.price)) {
      this.transaction.price = 0.00
    }

    this.backendService.put_transaction(this.id, this.transaction).subscribe(result =>
      {
        this.location.back();
      }
    );
  }    
}
