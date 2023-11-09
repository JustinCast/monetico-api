import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GmailService } from './services/Gmail.service';
import { GmailController } from './controllers/gmail.controller';

@Module({
  imports: [HttpModule],
  controllers: [GmailController],
  providers: [GmailService],
})
export class AppModule {}
