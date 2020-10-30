import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";


@ObjectType() // Converts a class into an object type
@Entity()
export class Post {

  @Field() // Exposing these field to a graphql schema when providing data to a query/mutation
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date",})
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date",onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({type:"text"})
  title!: string;

}