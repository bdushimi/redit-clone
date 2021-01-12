import { Box } from "@chakra-ui/core";
import React from "react";


export type WrapperVariants = "small" | "regular";

interface WrapperProps {
    variant?: WrapperVariants
}

export const Wrapper: React.FC<WrapperProps> = ({
    children,
    variant = "regular"
}) => {
    return (
        <Box
            mt={8}
            mx="auto"
            maxW={variant === 'regular' ? "500px" : "200px"}
            w="100%"
        >
            {children}
        </Box>
    );
}

export default Wrapper;