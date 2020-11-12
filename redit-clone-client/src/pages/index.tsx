import { withUrqlClient } from 'next-urql';
import React from 'react'
import { NavBar } from '../components/Navbar'
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [{ data }] = usePostsQuery();
return (
  <>
    <NavBar />
    <div>Hello there!</div>
    <br />
    {!data ? null : data.getPosts.map((post) => <div key={post.id}>{ post.title}</div>)}
  </>
)
}

export default withUrqlClient(createUrqlClient, {ssr : true}) (Index);
