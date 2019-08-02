import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material';

import {BackendService} from '../backend.service'
import {SymbolComponent} from '../symbol/symbol.component'

@Component({
  selector: 'app-symbols',
  templateUrl: './symbols.component.html',
  styleUrls: ['./symbols.component.css']
})
export class SymbolsComponent implements OnInit {
  dataSource = new MatTableDataSource()
  showingSymbol = false;
  @ViewChild(SymbolComponent, {static: false})
  private symbolComponent: SymbolComponent;

  constructor(private backendService: BackendService) { }

  ngOnInit() {
    this.dataSource.data = [];

    this.backendService.symbols().subscribe(data => 
      {
        this.dataSource.data = data;
      }
    );
  }

  showSymbol(symbol) {
    this.symbolComponent.setSymbol(symbol);
    this.showingSymbol = true;
  }

  onSymbolClosed(closed: boolean) {
    this.showingSymbol = false;
  }
}
