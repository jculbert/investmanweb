import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DividendSummaryReportComponent } from './dividend-summary-report/dividend-summary-report.component'
import { AccountsComponent }    from './accounts/accounts.component';
import { HoldingsComponent }    from './holdings/holdings.component';

const routes: Routes = [
  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: 'dividendsummaryreport', component: DividendSummaryReportComponent },
  { path: 'accounts',  component: AccountsComponent },
  { path: 'holdings/:account',  component: HoldingsComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule { }
