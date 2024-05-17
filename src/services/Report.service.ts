import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { flatten } from 'lodash';

import * as MOCKED_RESPONSE from '../data/txs.json'; // or use const inside the controller function
import { Report } from '@/models';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report) public reportRepository: Repository<Report>,
  ) {}

  getReports() {
    return MOCKED_RESPONSE.data;
  }
  /**
   * This function should compare the reports in the db with the incoming reports
   */

  processReports(emails: any[]) {
    this.reportRepository.upsert(flatten(emails.map(({ value }) => value)), [
      'id',
    ]);
  }
}
