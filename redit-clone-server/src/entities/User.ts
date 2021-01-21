import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,  } from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";


@ObjectType() // Converts a class into an objectType that exposes all fields through GraphQL
@Entity()
export class User extends BaseEntity {

  @Field() // Exposing this field to a graphql schema
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({unique:true})
  username!: string;
    

  @Column()
  password!: string;

  // OneToMany i.e. one user can have many photos
  @OneToMany(() => Post, post => post.creator)
  posts: Post[];


  // One user can do many upvotes
  @OneToMany(() => Updoot, updoot => updoot.user)
  updoots: Updoot[];


  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date;

}