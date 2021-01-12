import React from 'react';
import { NavBar } from './Navbar';
import Wrapper, { WrapperVariants } from './wrapper';

interface LayoutProps {
    variant? : WrapperVariants
}


const Layout: React.FC<LayoutProps> = ({children, variant}) => {
    return (
        <>
            <NavBar />
            <Wrapper variant={variant}>
                {children}
            </Wrapper>
        </>
    );
}

export default Layout;

