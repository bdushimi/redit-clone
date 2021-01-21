import { Box, Flex, Heading, IconButton } from '@chakra-ui/core';
import React from 'react';
import {PostSnippetFragment, useVoteMutation } from '../generated/graphql';


interface UpdootSectionProps {
    post: PostSnippetFragment
}


export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    
    const [, vote] = useVoteMutation();

    return (
        <Flex direction="column" justifyContent="center" alignItems="center" mr={5}>
            <IconButton
                icon="chevron-up"
                aria-label="updoot post"
                variantColor={post.voteStatus === 1? "green" : undefined}
                onClick={async () => { 
                    if(post.voteStatus === 1) return;
                    await vote({
                        postId: post.id,
                        value : 1
                    })
                }}
            />

            {post.points}
            
            <IconButton
                icon="chevron-down"
                aria-label="downdoot post"
                variantColor={post.voteStatus === -1? "red" : undefined}
                onClick={async () => {
                    if(post.voteStatus === -1) return;
                    await vote({
                        postId: post.id,
                        value : -1
                    })
                }}
            />
        </Flex>
    )
}