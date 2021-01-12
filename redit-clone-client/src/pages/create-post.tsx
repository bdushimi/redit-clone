import { Box, Flex, Link, Button } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import router from "next/dist/next-server/lib/router/router";
import React, { useEffect } from "react"
import InputField from "../components/InputField";
import Wrapper from "../components/wrapper"
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import login from "./login";
import {useRouter} from 'next/router';
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import  Layout  from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({ }) => {
    const router = useRouter();
    useIsAuth();
    
    const [, createPost] = useCreatePostMutation();
    return (
        <Layout variant="regular">
            <Formik
      initialValues={{ title:"", text:"" }}
      onSubmit={async(values) => {
          const { error } = await createPost({ input: values });
          if (!error) {
              router.push('/');
          }
      }}
    >
      {({isSubmitting}) => (
        <Form>
              <InputField name="title" placeholder="Title" label="Title" />
              <Box mt={2}>
                <InputField textarea name="text" placeholder="Text..." label="body" />
              </Box>
              <Button mt={5} type="submit" variantColor="teal" isLoading={isSubmitting}>Create post</Button>
        </Form>
      )}
    </Formik>
        </Layout>
    )
}


export default withUrqlClient(createUrqlClient)(CreatePost);