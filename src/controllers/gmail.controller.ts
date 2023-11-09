import { Controller, Get, Query } from '@nestjs/common';
import { GmailService } from '../services/Gmail.service';

@Controller()
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Get()
  verify(@Query() code) {
    console.log(code);
    // this.gmailService.signUp();
  }
}
