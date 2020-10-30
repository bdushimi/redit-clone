import { User } from '../entities/User';
import 'reflect-metadata';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2  from 'argon2';

@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;
}


@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}



@Resolver()
export class UserResolver {

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: MyContext)
    {
        if (!req.session.userId) {
            return null;
        }
        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { em }: MyContext): Promise<UserResponse>
    {
        const hashedPassword = await argon2.hash(options.password);
        const user = await em.create(User, { username: options.username, password: hashedPassword});
        try {
            await em.persistAndFlush(user);
        } catch (error) {
            if (error.code === "23505") {
                return {
                errors: [
                    {
                        field: 'username',
                        message: "username already taken",
                    },
                ]
            };
            }
        }
        return {
            user,
        };
    }

    
    @Query(() => UserResponse)
    async login(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext): Promise<UserResponse>
    {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "That username does not exist",
                    }
                ],
            };
        }

        const isPasswordValid = await argon2.verify(user.password, options.password);
        if (!isPasswordValid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Incorrect password"
                    }
                ]
            };
        }

        req.session.userId = user.id;
        return {
            user: user
        }
    }
}