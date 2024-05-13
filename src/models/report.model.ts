import { Field, ObjectType } from '@nestjs/graphql';
import { JoinColumn, ManyToOne } from 'typeorm';
import { User } from '@/models';

@ObjectType()
export class Report {
  @Field(() => String)
  id: string;

  @Field(() => String)
  bank: string;

  @Field(() => String)
  bankName: string;

  @Field(() => String)
  date: string;

  @Field(() => String)
  hour: string;

  @Field(() => String)
  place: string;

  @Field(() => String)
  total: string;

  @ManyToOne(() => User)
  @JoinColumn()
  @Field(() => User)
  user: User;
}
