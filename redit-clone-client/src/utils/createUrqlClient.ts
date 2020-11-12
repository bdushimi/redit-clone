import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import { LogoutMutation, MeQuery, MeDocument, LoginMutation } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";


export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include" as const,
    },
    exchanges: [dedupExchange, cacheExchange({
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
    }), ssrExchange, fetchExchange]
});