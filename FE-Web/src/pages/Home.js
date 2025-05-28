import React from "react";
import styled from "styled-components";
import LoginForm from "../components/LoginForm";
import AuthProvider from "../authToken/index";

const HomeContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #eef2fe;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  gap: 80px;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const LoginSection = styled.div`
  width: 100%;
  max-width: 440px;
  flex-shrink: 0;
`;

const Home = () => {
  return (
    <HomeContainer>
      <ContentWrapper>
        <LoginSection>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </LoginSection>
      </ContentWrapper>
    </HomeContainer>
  );
};

export default Home;
