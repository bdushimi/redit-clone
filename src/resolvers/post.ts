import 'reflect-metadata';
import { Post } from '../entities/Post';
import { MyContext } from 'src/types';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {

    // Queries are for getting data
    @Query(() => [Post]) // Adds the return a graphql return type i.e () => [Post]
    getPosts( @Ctx() {em}: MyContext) : Promise<Post[]> { // Adds a typescript return type i.e Promise<Post[]>
        return em.find(Post, {});
    }


    @Query(() => Post, {nullable: true})
    getPost(
        // Adds graphql type i.e. 'id', () => Int
        // Add typescript types id: number
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext): Promise<Post | null> {
        // return a post or null i.e. Promise<Post | null
        return em.findOne(Post, {id});
    }


    // Mutation are for creating/updating/deleting data
    @Mutation(() => Post)
    async createPost(
        @Arg('title', () => String) title: string,
        @Ctx() { em }: MyContext): Promise<Post> {
        const post = em.create(Post, { title });
        await em.persistAndFlush(post);
        return post;
    }



    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, {nullable: false}) title: string,
        @Ctx() { em }: MyContext): Promise<Post | null> {
        const post = await em.findOne(Post, { id });
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            post.title = title;
            await em.persistAndFlush(post);
        }
        return post;
    }



    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext): Promise<boolean> {
        try {
            await em.nativeDelete(Post, { id });
            return true;
        } catch (error) {
            return false;
        }
    }
}