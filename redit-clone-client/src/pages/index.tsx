import { Link } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react'
import Layout from '../components/Layout';
import { NavBar } from '../components/Navbar'
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';

const Index = () => {
  const [{ data }] = usePostsQuery();
return (
  <Layout>
    <NextLink href="/create-post">
      <Link>Create Post</Link>
    </NextLink>
    <br />
    {!data ? null : data.getPosts.map((post) => <div key={post.id}>{ post.title}</div>)}
  </Layout>
)
}

export default withUrqlClient(createUrqlClient, {ssr : true}) (Index);
