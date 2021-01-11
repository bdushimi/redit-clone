import React from 'react';
import { Formik, Form} from 'formik';
import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Link } from '@chakra-ui/core';
import Wrapper from '../components/wrapper';
import InputField from '../components/InputField';
import { useMutation } from 'urql';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

interface loginProps { }

// const REGISTER_MUT = `
// mutation Register ($username: String!, $password: String!){
//   register(options:{username:$username, password:$password}){
//     errors{
//       field
//       message
//     }
//     user{
//       username
//       id
//     }
//   }
// }
// `

export const Login: React.FC<loginProps> = ({ }) => {
  const router = useRouter();
  // const [,register] = useMutation(REGISTER_MUT);
  // useRegisterMutation is a hook generated by GraphQL Code Generator
  const [,login] = useLoginMutation(); 
    return (
        <Wrapper variant="regular">
            <Formik
      initialValues={{ username:"", password:"" }}
      onSubmit={async(values, {setErrors}) => {
        const response = await login({options: values}); // No need to destructure the values object because its values (i.e. username & password) line up with the values being passed in the Register mutation
        if (response.data?.login.errors) {
          setErrors(toErrorMap(response.data.login.errors));
        } else if (response.data?.login.user) {
          router.push('/');
        }
      }}
    >
      {({isSubmitting}) => (
        <Form>
              <InputField name="username" placeholder="Username" label="Username" />
              <Box mt={2}>
                <InputField name="password" placeholder="Password" label="Password" type="password" />
              </Box>
              <Flex mt={2}>
                <NextLink href="/forgot-password">
                  <Link ml='auto'>Forgot Password?</Link>
                </NextLink>
              </Flex>
              <Button mt={5} type="submit" variantColor="teal" isLoading={isSubmitting}>Login</Button>
        </Form>
      )}
    </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(Login);