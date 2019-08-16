import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core'
import {MatTableDataSource} from '@angular/material'

import {BackendService, SymbolData} from '../backend.service'
import { SymbolComponent } from '../symbol/symbol.component'
import {TransactionsComponent} from '../transactions/transactions.component'

@Component({
  selector: 'app-holdings',
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.css']
})
export class HoldingsComponent implements OnInit {
  dataSource = new MatTableDataSource()
  account : string
  showingSymbol = false
  showingTransactions = false;
  @ViewChild(SymbolComponent, {static: false})
  private symbolComponent: SymbolComponent;
  @ViewChild(TransactionsComponent, {static: false})
  private transactionsComponent: TransactionsComponent;
  @Output() holdingsClosed = new EventEmitter<boolean>();
  @Output() accountHoldingsClicked = new EventEmitter<string>();

  constructor(
    private backendService: BackendService,
  ) {
    this.dataSource.data = [];
  }

  ngOnInit() {
  }

  setAccount(account: string) {
    this.account = account;
    this.backendService.holdings(this.account).subscribe(data => 
      {
        this.dataSource.data = data;
      }
    );
  }

  showSymbol(symbol: SymbolData) {
    this.symbolComponent.setSymbol(symbol);
    this.showingSymbol = true;
  }

  showTransactions(account: string, symbol: SymbolData) {
    this.transactionsComponent.setAccountAndSymbol(account, symbol)
    this.showingTransactions = true;
  }

  accountHoldingsClick(account: string) {
    this.accountHoldingsClicked.emit(account);
  }

  onSymbolClosed() {
    this.showingSymbol = false;
  }

  onTransactionsClosed() {
    this.showingTransactions = false;
  }

  close(){
    this.dataSource.data = [];
    this.holdingsClosed.emit(true);
  }
}
