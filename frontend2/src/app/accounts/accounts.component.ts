import { Component, OnInit, ViewChild } from '@angular/core';
//import { Observable } from 'rxjs/Observable';
import {MatTableDataSource} from '@angular/material';

import {BackendService} from '../backend.service'
import { DualHoldingsComponent } from '../dual-holdings/dual-holdings.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  showingHoldings = false;
  dataSource = new MatTableDataSource()
  @ViewChild(DualHoldingsComponent, {static: true})
  private holdingsComponent: DualHoldingsComponent;

  constructor(private backendService: BackendService) { }

  ngOnInit() {
    this.dataSource.data = [];

    this.backendService.accounts().subscribe(data => 
      {
        var accounts = [{name: "All", currency: "-"}];
        accounts = accounts.concat(data);
        this.dataSource.data = accounts;
      }
    );
  }

  showHoldings(account: string) {
    this.holdingsComponent.setMainAccount(account);
    this.showingHoldings = true;
  }

  onDualHoldingsClosed() {
    this.showingHoldings = false;
  }
}

