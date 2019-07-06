import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolDividendReportComponent } from './symbol-dividend-report.component';

describe('SymbolDividendReportComponent', () => {
  let component: SymbolDividendReportComponent;
  let fixture: ComponentFixture<SymbolDividendReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SymbolDividendReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SymbolDividendReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
