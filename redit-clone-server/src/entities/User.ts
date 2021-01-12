import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,  } from "typeorm";
import { Post } from "./Post";


@ObjectType() // Converts a class into an object type
@Entity()
export class User extends BaseEntity {

  @Field() // Exposing these field to a graphql schema
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


  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date;

}