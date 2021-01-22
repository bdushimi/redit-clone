import { Heading } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import Layout from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import useGetPostFromUrl from '../../utils/useGetPostFromUrl';

const Post = ({ }) => {
    const [{ data, error, fetching }] = useGetPostFromUrl();

    if (fetching) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        )
    }


    if (!data?.getPost) {
        return (
            <Layout>
                <div>Could not find the post</div>
            </Layout>
        )
    }


    if (error) {
        return (
            <Layout>
               {error.message}
            </Layout>
        )
    }
    
    return (
        <Layout>
            <Heading fontSize="xl" mb={4}>{data?.getPost?.title}</Heading>
            {data?.getPost?.text}
        </Layout>
    );
}


export default withUrqlClient(createUrqlClient, {ssr : true})(Post)