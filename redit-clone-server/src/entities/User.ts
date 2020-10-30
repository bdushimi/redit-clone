import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";


@ObjectType() // Converts a class into an object type
@Entity()
export class User {

  @Field() // Exposing these field to a graphql schema
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date",})
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date",onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({type:"text", unique:true})
  username!: string;
    

  @Property({type:"text"})
  password!: string;

}