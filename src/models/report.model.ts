import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '@/models';

@ObjectType({ description: 'Report model' })
@Entity()
export class Report {
  @Field(() => String)
  @PrimaryColumn()
  id: string;

  @Field(() => String)
  @Column()
  bank: string;

  @Field(() => String)
  @Column()
  bankName: string;

  @Field(() => String)
  @Column()
  date: string;

  @Field(() => String)
  @Column()
  hour: string;

  @Field(() => String)
  @Column()
  place: string;

  @Field(() => String)
  @Column()
  total: string;

  @ManyToOne(() => User)
  @JoinColumn()
  @Field(() => User)
  user: User;
}
