import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountsComponent }    from './accounts.component';
import { AccountHoldingComponent }    from './account-holding.component';

const accountsRoutes: Routes = [
  { path: 'accounts',  component: AccountsComponent },
  { path: 'accounts/account-holdings',  component: AccountHoldingComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(accountsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AccountsRoutingModule { }