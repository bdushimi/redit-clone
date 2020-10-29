import "reflect-metadata"
import { HelloResolver } from './resolvers/hello';

import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from './constants';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    // const post = await orm.em.create(Post, { title: "My first Post" });
    // await orm.em.persistAndFlush(post);

    const app = express();

    const appolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        // context is a special object that is available to all resolvers
        context: () => ({
           em : orm.em 
        })
    })

    appolloServer.applyMiddleware({ app });
    app.listen(4000, () => {
        console.log("Server is listening on 4000 port")
    })
}

main()
    .catch(err => {
        console.log(err)
    });