import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GmailService } from './services/Gmail.service';
import { GmailController } from './controllers/gmail.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ReportService } from './services/Report.service';
import { ReportResolver } from './resolvers/report.resolver';

@Module({
  imports: [
    HttpModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
    }),
  ],
  controllers: [GmailController],
  providers: [GmailService, ReportService, ReportResolver],
})
export class AppModule {}
