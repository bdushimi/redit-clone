import 'reflect-metadata';
import { Post } from '../entities/Post';
import { Arg, InputType, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {

    @InputType()
         
        
        
        
    // Queries are for getting data
    @Query(() => [Post]) // Adds the return a graphql return type i.e () => [Post]
    getPosts() : Promise<Post[]> { // Adds a typescript return type i.e Promise<Post[]>
        return Post.find();
    }


    @Query(() => Post, {nullable: true})
    getPost(
        // Adds graphql type i.e. 'id', () => Int
        // Add typescript types id: number
        @Arg('id', () => Int) id: number): Promise<Post | undefined> {
        // return a post or null i.e. Promise<Post | null
        return Post.findOne(id);
    }


    // Mutation are for creating/updating/deleting data
    @Mutation(() => Post)
    async createPost(
        @Arg('title', () => String) title: string): Promise<Post> {
        return Post.create({ title }).save();
    }



    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, {nullable: false}) title: string): Promise<Post | null> {
        const post = await Post.findOne(id);
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            await Post.update({ id }, { title });
        }
        return post;
    }



    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number): Promise<boolean> {
        try {
            await Post.delete(id);
            return true;
        } catch (error) {
            return false;
        }
    }
}