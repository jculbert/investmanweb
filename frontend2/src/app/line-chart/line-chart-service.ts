import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';
 
export interface LineChartPoint {
    t: Date;
    y: number;
  }
  
@Injectable()
export class LineChartService {
    public data: LineChartPoint[];
}