import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule }    from '@angular/common/http';

import { AppComponent } from './app.component';
import { BackendService } from './backend.service';
import { DividendSummaryReportComponent } from './dividend-summary-report/dividend-summary-report.component';
import { AppRoutingModule } from './/app-routing.module';
import {CdkTableModule} from '@angular/cdk/table';
import {MatDialogModule} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatDatepickerModule, MatNativeDateModule, MatInputModule, MatButtonModule, MatTableModule, MatSidenavModule, MatCardModule} from '@angular/material'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AccountsComponent } from './accounts/accounts.component';
import { HoldingsComponent } from './holdings/holdings.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { TransactionComponent } from './transaction/transaction.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { UploadComponent } from './upload/upload.component';


@NgModule({
  declarations: [
    AppComponent,
    DividendSummaryReportComponent,
    AccountsComponent,
    HoldingsComponent,
    TransactionsComponent,
    TransactionComponent,
    ConfirmDialogComponent,
    UploadComponent
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    CdkTableModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatTableModule,
    MatSidenavModule,
    MatCardModule,
  ],
  providers: [BackendService],
  bootstrap: [AppComponent]
})
export class AppModule { }
