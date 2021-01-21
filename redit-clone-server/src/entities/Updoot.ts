import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// many to many relationship
// users can upvote many posts
// users -> join table <- posts
// users -> updoot <- posts

@Entity()
export class Updoot extends BaseEntity{

  @Column({ type: "int" })
  value: number;
    
  @PrimaryColumn()
  userId: number;

  // Many votes from one user
  @ManyToOne(() => User, user => user.updoots)
  user: User;
    

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, post => post.updoots, {
    onDelete : "CASCADE"
  })
  post: Post;

}