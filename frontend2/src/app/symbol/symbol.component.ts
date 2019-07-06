import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';

import {BackendService, SymbolData} from '../backend.service'

@Component({
  selector: 'app-symbol',
  templateUrl: './symbol.component.html',
  styleUrls: ['./symbol.component.css']
})
export class SymbolComponent implements OnInit {
  name : string
  symbol : SymbolData = undefined

  constructor(
    public location: Location,
    private backendService: BackendService,
    private route: ActivatedRoute

  ) {}

  ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name');
    this.backendService.get_symbol(this.name).subscribe(data => 
      {
        this.symbol = data;
      }
    );
  }

  onSave(event: {}) {
    this.backendService.put_symbol(this.name, this.symbol).subscribe(result =>
      {
        this.location.back();
      }
    );
  }    
}
