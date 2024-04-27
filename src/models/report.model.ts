import { Field, ObjectType } from '@nestjs/graphql';

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
}
