import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CdkTableModule} from '@angular/cdk/table';
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatDatepickerModule, MatNativeDateModule, MatInputModule, MatButtonModule, MatTableModule, MatSidenavModule} from '@angular/material'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AccountsComponent }    from './accounts.component';
import { AccountHoldingComponent }    from './account-holding.component';
import { AccountsRoutingModule } from './accounts-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AccountsRoutingModule,
    CdkTableModule,
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
  declarations: [
    AccountsComponent,
    AccountHoldingComponent
  ]
})
export class AccountsModule {}