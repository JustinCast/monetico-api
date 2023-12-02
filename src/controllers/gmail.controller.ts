import { Body, Controller, Get, Post } from '@nestjs/common';
import { GmailService } from '../services/Gmail.service';

@Controller()
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Post('login')
  emails(@Body() { token }) {
    this.gmailService.readEmails(token);
  }

  @Get('success')
  successLogin(@Body() response) {
    console.log(response);
  }
}
