import "reflect-metadata"
import { HelloResolver } from './resolvers/hello';

import { MikroORM } from "@mikro-orm/core"
import { COOKIE_NAME, __prod__ } from './constants';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';


const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    // const post = await orm.em.create(Post, { title: "My first Post" });
    // await orm.em.persistAndFlush(post);

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
    }))
    app.use(session({
        name: COOKIE_NAME,
        store: new RedisStore({
            client: redisClient,
        }),

        cookie: {
            maxAge: 1000 * 60 * 5,
            httpOnly: true,
            sameSite: 'lax',
            secure: __prod__
        },
        saveUninitialized: false,
        secret: "redis-clone-secret",
        resave: false
    }))

    const appolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        // context is a special object that is available to all resolvers
        context: ({req, res}) => ({em: orm.em, req, res})
    })

    appolloServer.applyMiddleware({ app, cors: false});
    app.listen(4000, () => {
        console.log("Server is listening on 4000 port")
    })
}

main()
    .catch(err => {
        console.log(err)
    });