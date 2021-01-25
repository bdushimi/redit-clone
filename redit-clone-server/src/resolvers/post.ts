import 'reflect-metadata';
import { Post } from '../entities/Post';
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/isAuth'
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';




// This input type strongly types the input we're expected to get.
@InputType()
    class PostInputType {
    @Field()
    title: string

    @Field()
    text: string
}


// The object type is used to define the type of the returning object
@ObjectType()
class PaginatedPosts {
    @Field(() => [Post]) // Adds the return a graphql return type i.e () => [Post]
    posts: Post[]

    @Field()
    hasMore: boolean

}    
    
    
    
@Resolver(Post)
export class PostResolver {

    // A field resolve is meant to do processing on a requested database field and return processed info (to graphql)
    // without changing the original data (in the database) and avoiding data processing on the front-end
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ) {
        return root.text.slice(0, 50);
    }


    // This fetches the user on each post related request no matter where it is coming from.
    @FieldResolver(() => User)
    creator(
        @Root() post: Post,
        @Ctx() {userLoader} : MyContext
    ) {
        return userLoader.load(post.creatorId);
    }

    @FieldResolver(() => Int)
    async voteStatus(
        @Root() post: Post,
        @Ctx() { voteStatusLoader, req } : MyContext
    ) {
        if(!req.session.userId) return null;
        const voteStatus = await voteStatusLoader.load({
            postId: post.id, userId: req.session.userId
        });

        return voteStatus ? voteStatus.value : null;
    }
        
    // Queries are for getting data
    @Query(() => PaginatedPosts) 
    async getPosts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', ()=> String, { nullable: true}) cursor: string | null, // if the argument can be null, its type must be speficied in the @Arg decoration
        // @Ctx() {req} : MyContext
    ): Promise<PaginatedPosts> { // Adds a typescript return type i.e Promise<Post[]>

        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        // const userId = req.session.userId;

        const replacement: any[] = [realLimitPlusOne];

        // if (userId) {
        //     replacement.push(userId);
        // }

        //let cursorIndex = 3;

        if (cursor) {
            replacement.push(new Date(parseInt(cursor)));
            //cursorIndex = replacement.length;
        }

        const posts = await getConnection().query(`
        
        select p.*
        from post p
        ${cursor ? `where p."createdAt" < $2` : ""}
        order by p."createdAt" DESC
        limit $1
        `, replacement);


        // version 2 before creating votestatus resolver

        // select p.*,
        // ${
        //     userId 
        //     ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
        //     : 'null as "voteStatus" '
        // }
        // from post p
        // ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
        // order by p."createdAt" DESC
        // limit $1
        // `, replacement);

        // version 1 of the query used above

        // select p.*,
        // json_build_object(
        //     'id', u.id,
        //     'username', u.username
        // ) creator,
        // ${
        //     userId 
        //     ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
        //     : 'null as "voteStatus" '
        // }
        // from post p
        // inner join public.user u on u.id = p."creatorId"
        // ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
        // order by p."createdAt" DESC
        // limit $1
        // `, replacement);

        // const qb = getConnection()
        //     .getRepository(Post)
        //     .createQueryBuilder("Post")
        //     .innerJoinAndSelect("Post.creator", "User", 'User.id = Post."creatorId"')
        //     .orderBy('Post."createdAt"', "DESC")
        //     .take(realLimitPlusOne)

        
        // if (cursor) {
        //     qb.where('Post."createdAt" < :cursor', {
        //         cursor: new Date(parseInt(cursor))
        //     });
        // }

        // const posts = await qb.getMany();

        // console.log('posts', posts);
        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne
        }
    }


    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() {req} : MyContext
    ) {
        
        const isUpDoot = value !== -1;
        const realValue = isUpDoot ? 1 : -1;
        const { userId } = req.session;

        const updoot = await Updoot.findOne({ where: { postId, userId } });

        if (updoot && updoot.value !== realValue) {

            await getConnection().transaction(async tm => {
                await tm.query(`
                update updoot
                set value = $1
                where "postId" = $2 and "userId" = $3
                `, [realValue, postId, userId]);


                await tm.query(`
                update post
                set points = points + $1
                where id = $2
                `, [2*realValue, postId]);
            })
            
        } else if (!updoot) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                insert into updoot ("userId", "postId", value)
                values($1, $2, $3)
                `, [userId, postId, realValue]);

                await tm.query(`
                update post
                set points = points + $1
                where id = $2
                `, [realValue, postId]);
             })
        }

        return true
    }
    
    @Query(() => Post, {nullable: true})
    getPost(
        // Adds graphql type i.e. 'id', () => Int
        // Add typescript types id: number
        @Arg('id', () => Int) id: number): Promise<Post | undefined> {
        // return a post or null i.e. Promise<Post | null
        // With the second parameter, typeorm finds in other tables (user table) where the creator field establishes a relationship
        // and finds a user who created this post

        // return Post.findOne(id, { relations: ["creator"] }); before the introduction of creator resolver
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

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String, { nullable: false }) title: string,
        @Arg('text', () => String, { nullable: false }) text: string,
        @Ctx() {req} : MyContext
    ): Promise<Post | null> {
        // return Post.update({ id, creatorId : req.session.userId}, { title, text });
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and "creatorId" = :creatorId',
                { id, creatorId: req.session.userId })
            .returning("*")
            .execute();
        
        return result.raw[0];
    }



    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)

    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() {req} : MyContext
    ): Promise<boolean> {
        try {
            await Post.delete({ id, creatorId : req.session.userId});
            return true;
        } catch (error) {
            return false;
        }
    }
}