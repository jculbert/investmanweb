import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DividendSummaryReportComponent } from './dividend-summary-report/dividend-summary-report.component'
import { AccountsComponent }    from './accounts/accounts.component';
import { AccountHoldingComponent }    from './accounts/account-holding.component';

const routes: Routes = [
  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: 'dividendsummaryreport', component: DividendSummaryReportComponent },
  { path: 'accounts',  component: AccountsComponent },
  { path: 'accounts/account-holdings',  component: AccountHoldingComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule { }
