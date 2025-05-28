import React, {useState, useContext } from "react";
import { Link, useNavigate } from 'react-router-dom';

import {images} from "../assets";
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { AuthToken } from '../authToken';
import styled from "styled-components";
import route from '../configs/route';


const Header = () => {
	let { user, role, logout } = useContext(AuthToken);

	const [expanded, setExpanded] = useState(false);
	let navigate = useNavigate();

	const closeNavbar = () => setExpanded(false);

    return (
		<HeaderStyled
		expand="lg"
		className="bg-body-tertiary"
		expanded={expanded}>
    <Container>
        <LogoStyled href={route.home}>
            {/* <img src={images.logoMEME} alt="" /> */}
            {/* <h1>CHAT APP MEME</h1> */}
        </LogoStyled>

				<Navbar.Toggle
					aria-controls="basic-navbar-nav"
					onClick={() => setExpanded(!expanded)}
					/>

				<NavStyled id="basic-navbar-nav">
					<Nav>
						<Nav.Link
							as={LinkStyled}
							to={route.home}
							onClick={closeNavbar}>
							
						</Nav.Link>

						<Nav.Link
							as={LinkStyled}
							to={route.chat}
							onClick={closeNavbar}>
							
						</Nav.Link>
						{!user ? (
							<Nav.Link
							as={LinkStyled}
							to={route.login}
							onClick={closeNavbar}
							>
								
							</Nav.Link>
						) : (
							<NavDropdown title="Tài khoản" id="account">
								<NavDropdown.Item
									onClick={() => {
										logout();
										navigate(route.login);

										closeNavbar();
									}}
									href={route.login}
									as={LinkStyled}
									>
									Đăng xuất
								</NavDropdown.Item>
							</NavDropdown>
						)}
					</Nav>
				</NavStyled>
      </Container>
    </HeaderStyled>
    )
}

const HeaderStyled = styled(Navbar)`
	// position: absolute;
	width: 100%;
	border-bottom: 1px solid rgba(0, 0, 0, 0.2);
	height: 100px;
	z-index: 10000;
`;

const LogoStyled = styled.a`
	display: flex;
	align-items: center;
	cursor: pointer;
	text-decoration: none;

	p {
		color: var(--primary);
		margin-bottom: 0;
		font-size: 1.25rem;
		font-weight: 600;
		margin-left: 5px;
	}

	img {
		width: 7rem;
	}
`;

const NavStyled = styled(Navbar.Collapse)`
	justify-content: end;
	backdrop-filter: blur(8px);
	.nav-link {
		color: #333;
		font-weight: 600;
		font-size: 1.225rem;
		margin-left: 1rem;

		&.active {
			font-weight: 600;
		}
	}
	.nav-link:hover {
		color: var(--primary);
	}
`;
const LinkStyled = styled(Link)`
	text-decoration: none;
	color: var(--bs-nav-link-color);
`;

export default Header;