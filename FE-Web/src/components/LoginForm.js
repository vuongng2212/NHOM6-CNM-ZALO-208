import React, { useContext, useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import route from "../configs/route";
import { AuthToken } from "../authToken";
import styled from "styled-components";

const LoginContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
`;

const CardStyled = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  width: 100%;
  background: #fff;
  border: none;
`;

const CardBodyStyled = styled(Card.Body)`
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  color: #0068ff;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
  font-size: 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: #7589a3;
  text-align: center;
  margin-bottom: 32px;
  font-size: 14px;
  line-height: 1.5;
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #7589a3;
  font-size: 16px;
`;

const FormControlWithIcon = styled(Form.Control)`
  padding: 12px 16px 12px 48px;
  border-radius: 24px;
  border: 1px solid #dfe1e6;
  font-size: 14px;
  height: auto;
  background-color: #f1f3f5;

  &:focus {
    box-shadow: 0 0 0 2px rgba(0, 104, 255, 0.2);
    border-color: #0068ff;
    background-color: #fff;
  }

  &::placeholder {
    color: #7589a3;
  }
`;

const FormGroupStyled = styled(Form.Group)`
  position: relative;
  margin-bottom: 16px;
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 12px;
  font-weight: 600;
  font-size: 15px;
  background-color: #0068ff;
  border: none;
  margin-top: 8px;

  &:hover,
  &:focus {
    background-color: #0051cc;
  }

  &:active {
    background-color: #004299;
  }
`;

const StyledLink = styled.a`
  color: #0068ff;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    color: #0051cc;
    text-decoration: none;
  }
`;

const LinksContainer = styled.div`
  text-align: center;
  margin-top: 24px;

  & > * {
    margin: 8px 0;
  }
`;

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useContext(AuthToken);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate(route.chat);
    } catch (err) {
      if (err.response) {
        setErrorMessage(err.response.data);
      } else if (err.request) {
        setErrorMessage(
          "Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng của bạn"
        );
      } else {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <CardStyled>
      <CardBodyStyled>
        <Title>Zalo</Title>
        <Subtitle>
          Đăng nhập tài khoản Zalo
          <br />
          để kết nối với ứng dụng Zalo Web
        </Subtitle>

        {errorMessage && (
          <Alert
            variant="danger"
            className="mb-4 w-100"
            style={{
              borderRadius: "12px",
              fontSize: "14px",
              backgroundColor: "#fff2f0",
              borderColor: "#ffccc7",
              color: "#ff4d4f",
            }}
          >
            {errorMessage}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className="w-100">
          <FormGroupStyled>
            <IconWrapper>
              <FaEnvelope />
            </IconWrapper>
            <FormControlWithIcon
              type="email"
              placeholder="Nhập email của bạn"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroupStyled>

          <FormGroupStyled>
            <IconWrapper>
              <FaLock />
            </IconWrapper>
            <FormControlWithIcon
              type="password"
              placeholder="Nhập mật khẩu"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormGroupStyled>

          <StyledButton type="submit" className="w-100">
            Đăng nhập
          </StyledButton>

          <LinksContainer>
            <div>
              <StyledLink onClick={() => navigate(route.sendOtp)}>
                Chưa có tài khoản? Đăng ký ngay
              </StyledLink>
            </div>
            <div>
              <StyledLink onClick={() => navigate(route.forgotPassword)}>
                Quên mật khẩu?
              </StyledLink>
            </div>
          </LinksContainer>
        </Form>
      </CardBodyStyled>
    </CardStyled>
  );
};

export default LoginForm;
