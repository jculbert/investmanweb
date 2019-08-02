import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';
import { FormControl } from '@angular/forms';

import {BackendService, SymbolData} from '../backend.service'

@Component({
  selector: 'app-symbol',
  templateUrl: './symbol.component.html',
  styleUrls: ['./symbol.component.css']
})
export class SymbolComponent implements OnInit {
  symbol : SymbolData = undefined
  @Output() symbolClosed = new EventEmitter<boolean>();

  //public notesFC = new FormControl()

  constructor(
    public location: Location,
    private backendService: BackendService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
  }

  setSymbol(symbol: SymbolData) {
    this.symbol = symbol;
  }

  //onNotesChange() {
    //this.symbol.notes = this.notesFC.value;
  //} 

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
