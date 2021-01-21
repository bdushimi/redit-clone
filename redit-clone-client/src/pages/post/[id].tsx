import { Heading } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { type } from 'os';
import React from 'react';
import Layout from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const Post = ({ }) => {
    const router = useRouter();
    const id = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;

    const [{ data, error, fetching }] = usePostQuery({
        pause : id === -1,
        variables: {
             id : id
        }
    })

    if (fetching) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        )
    }


    if (error) {
        console.log(error.message)
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