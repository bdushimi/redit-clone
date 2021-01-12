import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";



@ObjectType() // Converts a class into an object type
@Entity()
export class Post extends BaseEntity{

  @Field() // Exposing these field to a graphql schema when providing data to a query/mutation
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type:"int", default: 0})
  points!: number;


  @Field()
  @Column()
  creatorId: number;

  // ManyToOne i.e. many photos can belong to one user
  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date;

}