import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core';
import React from 'react';
import NextLink from 'next/link';
import { useLoginMutation, useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({
        pause: isServer(), 
    });
    let body = null;

    if (fetching) {
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2} color="white"> Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link  color="white">Register</Link>
            </NextLink>
            </>
        );
    } else {
        body = (
            <Flex align="center">
                <NextLink href="/create-post">
                    <Button as={Link} mr={4}>Create Post</Button>
                </NextLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button onClick={() => {
                    logout();
                }}
                    isLoading={logoutFetching}
                    variant="link"
                >
                    Logout
                </Button>
            </Flex>
        )
    }
    
    return (
        <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
            <Flex flex={1} m="auto" align="center" maxW={800}>
                <NextLink href="/">
                    <Link>
                     <Heading> LiReddit </Heading>
                    </Link>
                </NextLink>
                <Box ml={"auto"}>{ body }</Box>
            </Flex>
        </Flex>
    );
}