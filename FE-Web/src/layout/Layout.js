import React from 'react';
import styled from 'styled-components';

const InnerStyled = styled.div`
	min-height: calc(100vh - 140px);
	align-items: center;
    display: flex;
`;

const Layout = ({ children }) => {
	return (
		<>
			<InnerStyled>{children}</InnerStyled>
		</>
	);
};

export default Layout;
