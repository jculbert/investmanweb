import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DividendSummaryReportComponent } from './dividend-summary-report/dividend-summary-report.component'
import { AccountsComponent }    from './accounts/accounts.component';
import { HoldingsComponent }    from './holdings/holdings.component';
import { TransactionsComponent }    from './transactions/transactions.component';
import { TransactionComponent }    from './transaction/transaction.component';
import { UploadComponent }    from './upload/upload.component';
import { SymbolsComponent }    from './symbols/symbols.component';
import { SymbolComponent }    from './symbol/symbol.component';

const routes: Routes = [
  { path: '', redirectTo: '/accounts', pathMatch: 'full' },
  { path: 'dividendsummaryreport', component: DividendSummaryReportComponent },
  { path: 'accounts',  component: AccountsComponent },
  { path: 'holdings/:account',  component: HoldingsComponent },
  { path: 'transactions',  component: TransactionsComponent },
  { path: 'transactions/:id',  component: TransactionComponent },
  { path: 'symbols',  component: SymbolsComponent },
  { path: 'symbols/:name',  component: SymbolComponent },
  { path: 'upload',  component: UploadComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule { }
