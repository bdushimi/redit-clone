import 'reflect-metadata';
import { Post } from '../entities/Post';
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/isAuth'
import { getConnection } from 'typeorm';



// This input type strongly types the input we're expected to get.
@InputType()
    class PostInputType {
    @Field()
    title: string

    @Field()
    text: string
}
@Resolver()
export class PostResolver {
        
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
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInputType,
        @Ctx() {req} : MyContext
    ): Promise<Post> {

        // This block of code is not working properly
        // return Post.create({
        //     title: input.title,
        //     text: input.text,
        //     creatorId : req.session.userId
        // }).save();

        const result = await getConnection()
                .createQueryBuilder()
                .insert().into(Post).values({
                    title: input.title,
                    text: input.text,
                    creatorId : req.session.userId
                }).returning("*")
                .execute();
            
        return result.raw[0];
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