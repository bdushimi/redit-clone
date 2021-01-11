import { User } from '../entities/User';
import 'reflect-metadata';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import {EntityManager} from "@mikro-orm/postgresql"
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { v4 } from 'uuid';
import { sendEmail } from '../../src/utils/sendEmail';

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

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, em, req}: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: "Length must be bigger than 2",
                    },
                ]
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: "Token expired",
                    },
                ]
            }
        }

        const user = await em.findOne(User, { id: parseInt(userId) });
        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: "User no longer exists",
                    },
                ]
            }
        }

        user.password = await argon2.hash(newPassword);
        await em.persistAndFlush(user);

        // remove the token from redis so it won't be used again to reset the password
        await redis.del(key);
        // log in user after change password
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    async forgetPassword(
        @Arg('email') email: string,
        @Ctx() { em, redis } : MyContext
    ) {
        const user = await em.findOne(User, { username: email }); // The username is the email in this instance
        if (!user) {
            // the email/username is not found
            return false;
        }

        const token = v4();
        await redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            'ex', 1000 * 60 * 60) // Token expires after 1 hours
        await sendEmail(email,
            `<a href="http://localhost:3000/change-password/${token}"> reset password</a>`
        )


        return true
        
    }

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
        // const user = await em.create(User, { username: options.username, password: hashedPassword});
        let user;
        console.log('requests reaches here');
        try {
            // await em.persistAndFlush(user);// This is the native way of interacting with the database
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
                username: options.username,
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date()
            }).returning("*");
            user = result[0];
        } catch (error) {
            if (error.detail.includes("already exists")) {
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

    
    @Mutation(() => UserResponse)
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

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
        })
        );
    }
}