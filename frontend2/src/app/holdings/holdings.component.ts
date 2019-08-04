import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import {MatTableDataSource} from '@angular/material';

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
  showingSymbol = false
  @ViewChild(SymbolComponent, {static: false})
  private symbolComponent: SymbolComponent;
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

  showSymbol(symbol) {
    this.symbolComponent.setSymbol(symbol);
    this.showingSymbol = true;
  }

  accountHoldingsClick(account: string) {
    this.accountHoldingsClicked.emit(account);
  }

  onSymbolClosed(closed: boolean) {
    this.showingSymbol = false;
  }

  close(){
    this.dataSource.data = [];
    this.holdingsClosed.emit(true);
  }
}
