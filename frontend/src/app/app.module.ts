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
import {MatDatepickerModule, MatNativeDateModule, MatInputModule, MatButtonModule, MatTableModule, MatSidenavModule} from '@angular/material'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';

@NgModule({
  declarations: [
    AppComponent,
    DividendSummaryReportComponent,
    NavigationComponent
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
  ],
  providers: [BackendService],
  bootstrap: [AppComponent]
})
export class AppModule { }
