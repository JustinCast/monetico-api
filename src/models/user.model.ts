import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Report } from '@/models';

@ObjectType()
@Entity()
export class User {
  @PrimaryColumn()
  @Field(() => String)
  email: string;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];
}
