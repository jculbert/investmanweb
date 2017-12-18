import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule }    from '@angular/common/http';

import { AppComponent } from './app.component';
import { BackendService } from './backend.service';
import { DividendSummaryReportComponent } from './dividend-summary-report/dividend-summary-report.component';
import { AppRoutingModule } from './/app-routing.module';
import {CdkTableModule} from '@angular/cdk/table';


@NgModule({
  declarations: [
    AppComponent,
    DividendSummaryReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CdkTableModule
  ],
  providers: [BackendService],
  bootstrap: [AppComponent]
})
export class AppModule { }
