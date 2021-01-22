import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

const useGetPostFromUrl = () => {
    const router = useRouter();
    const id = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;

    return usePostQuery({
        pause : id === -1,
        variables: {
             id : id
        }
    })
}

export default useGetPostFromUrl;