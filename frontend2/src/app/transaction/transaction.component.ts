import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {BackendService, TransactionData} from '../backend.service'

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  transaction : TransactionData = undefined
  @Output() transactionClosed = new EventEmitter<boolean>();

  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute

  ) {}

  ngOnInit() {
  }

  setTransaction(trans : TransactionData) {
    this.transaction = trans;
  }

  static notSet(value: any) {
    return value == undefined || value == null;
  }

  close(){
    this.transactionClosed.emit(true);
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

    this.backendService.put_transaction(String(this.transaction.id), this.transaction).subscribe(result =>
      {
        this.transactionClosed.emit(true);
      }
    );
  }    
}
