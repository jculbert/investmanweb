import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DividendSummaryReportComponent } from './dividend-summary-report/dividend-summary-report.component'

const routes: Routes = [
  { path: 'dividendsummaryreport', component: DividendSummaryReportComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule { }
