import { Request, Response } from 'express';
import { Redis } from "ioredis";
import { createVoteStatusLoader } from './utils/ createVoteStatusLoader';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = { 
    req: Request & { session: Express.Session };
    redis: Redis;
    res: Response;
    userLoader: ReturnType<typeof createUserLoader>
    // return type automatically sets the type of userLoader given the return createUserLoader function
    voteStatusLoader: ReturnType<typeof createVoteStatusLoader>
}