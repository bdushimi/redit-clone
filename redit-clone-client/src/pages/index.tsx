import { Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react'
import Layout from '../components/Layout';
import { NavBar } from '../components/Navbar'
import { useDeleteMutation, useGetPostsQuery, useMeQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import { useState }from 'react';
import { UpdootSection } from '../components/UpdootSection';


const Index = () => {


  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string // casting cursor variable to be either null or string
  });

  const [{ data: meData }] = useMeQuery();
  
  const [{ data, fetching }] = useGetPostsQuery({
    variables
  });

  const [, deletePost] = useDeleteMutation()


  if (!fetching && !data) {
    return <div>No Post fetched for some reason</div>
  }


  return (
    <Layout>
      <Flex align="center">
      </Flex>
      <br />
      {fetching && !data ? (
        <div>Loading data....</div>
      ) : (
          <Stack spacing={8}>
            {data!.getPosts.posts.map((post) =>
              !post
                ? null
                :  
            ( // adding an exclamation point to the variable forces typescript to believe that the variable wont' ever be undefined
              <Flex p={5} key={post.id} shadow="md" borderWidth="1px">
                <UpdootSection post={ post}/>
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>
                <Text>Posted by {post.creator.username}</Text>
                  <Flex alignItems="center">
                    <Text flex={1} mt={4}>{post.textSnippet}</Text>
                    
                        {
                          meData?.me?.id !== post.creator.id
                            ? null
                            :

                    
                            (<Box ml="auto">
                              <NextLink href="/post/edit/[id]" as={`post/edit/${post.id}`}>
                                <IconButton
                                  mr={2}
                                  icon="edit"
                                  aria-label="Edit Post"
                                  variantColor="green"
                                />
                              </NextLink>
                              <IconButton
                                icon="delete"
                                aria-label="Delete Post"
                                variantColor="red"
                                onClick={() => {
                                  deletePost({ id: post.id })
                                }}
                              />
                            </Box>
                        )
                     }  
                  </Flex>
                </Box>
                
              </Flex>
            ))} 
          </Stack>
        
        )}
      {data && data.getPosts.hasMore ? <Flex>
        <Button onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor : data.getPosts.posts[data.getPosts.posts.length - 1].createdAt,
          })
        }}
          isLoading={fetching} m="auto" my={8}>
          Load More
        </Button>
      </Flex> : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, {ssr : true}) (Index);
