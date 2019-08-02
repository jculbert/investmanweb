import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

import {BackendService, SymbolData} from '../backend.service'
import {SymbolDividendReportComponent} from '../symbol-dividend-report/symbol-dividend-report.component'

@Component({
  selector: 'app-symbol',
  templateUrl: './symbol.component.html',
  styleUrls: ['./symbol.component.css']
})
export class SymbolComponent implements OnInit {
  symbol : SymbolData = undefined
  showingDividends = false;
  @ViewChild(SymbolDividendReportComponent, {static: false})
  private dividendsComponent: SymbolDividendReportComponent;

  @Output() symbolClosed = new EventEmitter<boolean>();

  //public notesFC = new FormControl()

  constructor(
    private backendService: BackendService,
  ) {}

  ngOnInit() {
  }

  setSymbol(symbol: SymbolData) {
    this.symbol = symbol;
  }

  showDividends() {
    this.dividendsComponent.setSymbol(this.symbol)
    this.showingDividends = true;
  }

  onDividendReportClosed() {
    this.showingDividends = false;
  }

  onSave(event: {}) {
    this.backendService.put_symbol(this.symbol.name, this.symbol).subscribe(result =>
      {
        this.symbolClosed.emit(true);
      }
    );
  }
    
  close() {
    this.symbolClosed.emit(true);
  }
}
