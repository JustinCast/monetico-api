import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GmailService } from './services/Gmail.service';
import { GmailController } from './controllers/gmail.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ReportService } from './services/Report.service';
import { ReportResolver } from './resolvers/report.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

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
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [GmailController],
  providers: [GmailService, ReportService, ReportResolver],
})
export class AppModule {}
