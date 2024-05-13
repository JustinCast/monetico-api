import { Field, ObjectType } from '@nestjs/graphql';
import { OneToMany, PrimaryColumn } from 'typeorm';
import { Report } from '@/models';

@ObjectType()
export class User {
  @PrimaryColumn()
  @Field(() => String)
  email: string;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];
}
