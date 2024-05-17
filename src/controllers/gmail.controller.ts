import { Body, Controller, Get, Post } from '@nestjs/common';
import { GmailService } from '../services/Gmail.service';
import { ReportService } from '@/services';

@Controller()
export class GmailController {
  constructor(
    private readonly gmailService: GmailService,
    private readonly reportService: ReportService,
  ) {}

  @Post('login')
  async emails(@Body() { token, banks }) {
    try {
      const emails = await this.gmailService.readEmails(token, banks);

      this.reportService.processReports(emails);

      return emails;
    } catch (error) {
      // TODO: handle errors
    }
  }

  @Get('success')
  successLogin(@Body() response) {
    console.log(response);
  }
}
