import { Component, OnInit } from '@angular/core';
import {MatTableDataSource} from '@angular/material';

import {BackendService} from '../backend.service'

@Component({
  selector: 'app-symbols',
  templateUrl: './symbols.component.html',
  styleUrls: ['./symbols.component.css']
})
export class SymbolsComponent implements OnInit {
  dataSource = new MatTableDataSource()

  constructor(private backendService: BackendService) { }

  ngOnInit() {
    this.dataSource.data = [];

    this.backendService.symbols().subscribe(data => 
      {
        this.dataSource.data = data;
      }
    );
  }

}
