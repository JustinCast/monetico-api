import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { GmailController } from './controllers/gmail.controller';
import { ReportResolver } from './resolvers/report.resolver';
import { Report, User } from '@/models';
import { ReportService, GmailService } from '@/services';

@Module({
  imports: [
    HttpModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      sortSchema: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'monetico',
      entities: [User, Report],
      synchronize: true,
    }),
  ],
  controllers: [GmailController],
  providers: [GmailService, ReportService, ReportResolver],
})
export class AppModule {}
