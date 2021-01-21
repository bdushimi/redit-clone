import { Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react'
import Layout from '../components/Layout';
import { NavBar } from '../components/Navbar'
import { useGetPostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import { useState }from 'react';
import { UpdootSection } from '../components/UpdootSection';

const Index = () => {

  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string // casting cursor variable to be either null or string
  });
  
  const [{ data, fetching }] = useGetPostsQuery({
    variables
  });


  if (!fetching && !data) {
    return <div>No Post fetched for some reason</div>
  }


  return (
    <Layout>
      <Flex align="center">
        <Heading>LeReddit</Heading>
        <NextLink href="/create-post">
        <Link ml="auto">Create Post</Link>
      </NextLink>
      </Flex>
      <br />
      {fetching && !data ? (
        <div>Loading data....</div>
      ) : (
          <Stack spacing={8}>
            {data!.getPosts.posts.map((post) => ( // adding an exclamation point to the variable forces typescript to believe that the variable wont' ever be undefined
              <Flex p={5} key={post.id} shadow="md" borderWidth="1px">
                <UpdootSection post={ post}/>
                <Box>
                  <Heading fontSize="xl">{post.title}</Heading>
                <Text>Posted by {post.creator.username}</Text>
                <Text mt={4}>{post.textSnippet}</Text>
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
