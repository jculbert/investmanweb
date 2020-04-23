import { Component, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material';

import {BackendService, Transaction, TransactionData, SymbolData} from '../backend.service'
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component'
import {TransactionComponent} from '../transaction/transaction.component'

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  dataSource = new MatTableDataSource()
  account : string = undefined
  symbol : SymbolData = undefined
  upload_id: string = undefined
  showingTransaction = false;
  @ViewChild(TransactionComponent, {static: false})
  private transactionComponent: TransactionComponent;

  @Output() transactionsClosed = new EventEmitter<boolean>();

  constructor(
    public location: Location,
    private backendService: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialog: MatDialog
  ) { }

  ngOnInit() {

    this.dataSource.data = [];
    
    if (this.route.snapshot.queryParams.upload_id != undefined) {
      this.upload_id = this.route.snapshot.queryParams.upload_id;
      this.backendService.transactions_uploaded(this.upload_id).subscribe(data => 
        {
          this.dataSource.data = data;
        }
      );
    }
  }

  setAccountAndSymbol(account: string, symbol: SymbolData) {
    this.account = account;
    this.symbol = symbol;
    this.backendService.transactions(this.account, this.symbol.name).subscribe(data => 
      {
        this.dataSource.data = data;
      }
    );
  }

  showTransaction(transaction: TransactionData) {
    this.transactionComponent.setTransaction(transaction)
    this.showingTransaction = true;
  }

  onTransactionClosed() {
    this.showingTransaction = false;
  }

  onAdd(event: any) {
    var trans = new Transaction(this.account, this.symbol.name)
    this.backendService.add_transaction(trans).subscribe(data => 
      {
        this.transactionComponent.setTransaction(data);
        this.showingTransaction = true;
      }
    );
  }

  onDelete(id: string) {

    let dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: {
        prompt: "Delete Transaction?"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result == 'yes') {
        this.backendService.delete_transaction(id).subscribe(data => 
        {
          location.reload()
        });
      }
    });
  }

  close(){
    this.dataSource.data = [];
    this.transactionsClosed.emit(true);
  }
}

