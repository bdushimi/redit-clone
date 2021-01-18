import { Query } from './../generated/graphql';
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import { Exchange } from 'urql';

 // Since we're outside of react, no need to use useRouter
import Router from 'next/router';


const errorExchange: Exchange = ({ forward }) => ops$ => {

    return pipe(
        forward(ops$),
        tap(({ error }) => {
            // If the Operation Result has an error send a request to sentry
            if (error?.message.includes('You are not authenticated')) {
                
                // Replace the current route in the history rather than pushing a new entry
                Router.replace ('/');
            }
    
        })
    );
}

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include" as const,
    },
    exchanges: [dedupExchange, cacheExchange({
        keys: {
            PaginatedPosts: () => null
        },
        // Client-side resolvers, they just alter how
        resolvers: {
            // This resolver will always run whenever the Query "getPosts" runs
            Query: {
                getPosts: cursorPagination(),
            }
        },
        updates: {
            Mutation: {
                logout: (_result, args, cache, info) => {

                    // LoginMutation is the mutation being run and MeQuery is the query being cached/updated 
                    // (The results / data of MeQuery are invalidated since the return is null). 
                    betterUpdateQuery<LogoutMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        () => ({ me: null }),
                    );
                },
                login: (_result, args, cache, info) => {
                    // LoginMutation is the mutation being run and MeQuery is the query being cached/updated (The results/data of MeQuery are being cached/updated). 
                    // The next time MeQuery is executed (Data/Results of MeQuery are being requested), no API calls to the server will be made, but instead, the cached/updated result will be returned
                    betterUpdateQuery<LoginMutation, MeQuery>(
                        cache,
                        { query: MeDocument },
                        _result,
                        (result, query) => {
                            if (result.login.errors) {
                                return query
                            } else {
                                return {
                                    me: result.login.user
                                }
                            }
                        }
                    );
                },
            }
        }
    }), errorExchange, ssrExchange, fetchExchange]
});