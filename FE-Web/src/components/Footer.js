import React from 'react';
import styled from 'styled-components';

const FooterStyle = styled.div`
	height: 40px;
	width: 100%;
	font-weight: 400;
	color: rgba(33, 33, 33, 1);
	display: flex;
	align-items: center;
	justify-content: center;
	user-select: none;
	flex-direction: row;
	flex-wrap: wrap;
`;

const SplitLineStyled = styled.span`
	width: 80%;
	height:1px;
	opacity:0.5;
	background-color:#333;
`

const Footer = () => {
	return (
		<FooterStyle>
			<SplitLineStyled></SplitLineStyled>
			<p>
				Bản quyền 
			</p>
		</FooterStyle>
	);
};

export default Footer;
