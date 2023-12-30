import { Body, Controller, Get, Post } from '@nestjs/common';
import { GmailService } from '../services/Gmail.service';

@Controller()
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Post('login')
  async emails(@Body() { token, banks }) {
    return await this.gmailService.readEmails(token, banks);
  }

  @Get('success')
  successLogin(@Body() response) {
    console.log(response);
  }
}
