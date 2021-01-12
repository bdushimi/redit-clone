import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    // data contains the data from the Server
    // fetching indicates if the fetching operation currently taking place or not
    const [{ data, fetching }] = useMeQuery();
    const router = useRouter();
    useEffect(() => {

        if (!fetching && !data?.me) {
            router.replace("/login?next=" + router.pathname);
        }
    
        // run the callback function once the fetching or data props changes
    }, [fetching, data, router]);
}