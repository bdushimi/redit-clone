import { Box, Flex, Link, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import {useRouter} from 'next/router';
import React, { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/wrapper';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import login from './login';
import NextLink from 'next/link';
import { useForgotPasswordMutation } from '../generated/graphql';


const ForgotPassword: React.FC<{}> = ({ }) => {

    const [complete, setComplete] = useState(false);
    const [,forgetPassword] = useForgotPasswordMutation();
    const router = useRouter();
    
    return (
        <Wrapper variant="regular">
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    await forgetPassword(values);
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) => complete ?
                    <Box>
                        We have sent a password reset link to your email.
                    </Box> : (
                    <Form>
              <Box mt={2}>
                <InputField
                  name="email"
                  placeholder="email"
                  label="Email"
                  type="email" />
                
                <Button
                  mt={4}
                  type="submit"
                  isLoading={isSubmitting}
                  variantColor="teal"
                >
                  Send Email
                </Button>
              </Box>
        </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);