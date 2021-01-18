import "reflect-metadata"
import { HelloResolver } from './resolvers/hello';

import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from 'path';


const main = async () => {
    const conn = await createConnection({
        type: "postgres",
        database: "development_db",
        username: "developer",
        password: "developer@123",
        migrations: [path.join(__dirname, './migrations/*')],
        logging: true,
        synchronize: true,
        entities: [Post, User]
    });

    await conn.runMigrations();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
    }))
    app.use(session({
        name: COOKIE_NAME,
        store: new RedisStore({
            client: redis,
        }),

        cookie: {
            maxAge: 1000 * 60 * 10,
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
        context: ({req, res}) => ({req, res, redis})
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