import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";



@ObjectType() // Converts a class into an object type
@Entity()
export class Post extends BaseEntity{

  @Field() // Exposing these field to a graphql schema when providing data to a query/mutation
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column() // This adds the title to the Post table as a column
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({type:"int", default: 0})
  points!: number;

  @Field(() => Int, { nullable: true})
  voteStatus: number | null;


  @Field()
  @Column()
  creatorId: number;

  // ManyToOne i.e. many photos can belong to one user
  @Field()
  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @OneToMany(() => Updoot, updoot => updoot.post)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date;

}