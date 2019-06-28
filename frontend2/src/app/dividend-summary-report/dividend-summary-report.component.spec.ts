import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DividendSummaryReportComponent } from './dividend-summary-report.component';

describe('DividendSummaryReportComponent', () => {
  let component: DividendSummaryReportComponent;
  let fixture: ComponentFixture<DividendSummaryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DividendSummaryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DividendSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
