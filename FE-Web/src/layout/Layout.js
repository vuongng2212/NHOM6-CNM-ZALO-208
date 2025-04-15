import React from "react";
import styled from "styled-components";

const InnerStyled = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eef2fe;
  margin: 0;
  padding: 0;
`;

const Layout = ({ children }) => {
  return <InnerStyled>{children}</InnerStyled>;
};

export default Layout;
