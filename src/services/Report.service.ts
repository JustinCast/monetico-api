import { Injectable } from '@nestjs/common';
import * as MOCKED_RESPONSE from '../data/txs.json'; // or use const inside the controller function

@Injectable()
export class ReportService {
  getReports() {
    return MOCKED_RESPONSE;
  }
}
