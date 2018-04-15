import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DividendSummaryReportComponent } from './dividend-summary-report/dividend-summary-report.component'
import { AccountsComponent }    from './accounts/accounts.component';
import { HoldingsComponent }    from './holdings/holdings.component';
import { TransactionsComponent }    from './transactions/transactions.component';
import { TransactionComponent }    from './transaction/transaction.component';

const routes: Routes = [
  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: 'dividendsummaryreport', component: DividendSummaryReportComponent },
  { path: 'accounts',  component: AccountsComponent },
  { path: 'holdings/:account',  component: HoldingsComponent },
  { path: 'transactions',  component: TransactionsComponent },
  { path: 'transaction/:id',  component: TransactionComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule { }
