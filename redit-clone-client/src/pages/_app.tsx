import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core'
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange, QueryInput, Cache, query } from "@urql/exchange-graphcache";

import theme from '../theme'
import { LoginMutation, MeDocument, MeQuery, LogoutMutation } from '../generated/graphql';


function betterUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  result: any,
  fn: (result:Result, query:Query) => Query
) {
  return cache.updateQuery(queryInput, (data)=> fn(result, data as any) as any)
}


const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials:"include"
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
            () => ({me : null}),
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
  }), fetchExchange]
});

function MyApp({ Component, pageProps }: any) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
    </Provider>
    
  )
}

export default MyApp
