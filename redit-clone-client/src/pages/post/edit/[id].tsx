import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import useGetPostFromUrl from '../../../utils/useGetPostFromUrl';


const EditPost = ({ }) => {

    const router = useRouter();
    const [, updatePost] = useUpdatePostMutation()

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
        <Layout variant="regular">
            <Formik
      initialValues={{ title: data.getPost.title, text:data.getPost.text }}
      onSubmit={async(values) => {
          const { error } = await updatePost({
              id: data.getPost?.id as number,
              ...values
          })
          if (!error) {
              router.back();
          }
      }}
    >
      {({isSubmitting}) => (
        <Form>
              <InputField name="title" placeholder="Title" label="Title" />
              <Box mt={2}>
                <InputField textarea name="text" placeholder="Text..." label="body" />
              </Box>
              <Button mt={5} type="submit" variantColor="teal" isLoading={isSubmitting}>Update post</Button>
        </Form>
      )}
    </Formik>
        </Layout>
    )
}


export default withUrqlClient(createUrqlClient)(EditPost)