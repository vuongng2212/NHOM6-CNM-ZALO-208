import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import styled from "styled-components";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaArrowRight } from "react-icons/fa";
import route from "../configs/route";

const ForgotPasswordCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 440px;
  background: #fff;
  border: none;
  margin: 0 auto;
`;

const CardBodyStyled = styled(Card.Body)`
  padding: 40px 32px;
`;

const Title = styled.h2`
  color: #0068ff;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
  font-size: 28px;
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
  margin-bottom: 24px;
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #7589a3;
  font-size: 16px;
  margin-top: 12px;
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 15px;
  background-color: #0068ff;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;

  &:hover,
  &:focus {
    background-color: #0051cc;
  }

  &:active {
    background-color: #004299;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 24px;
`;

const StyledLink = styled.a`
  color: #0068ff;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    color: #0051cc;
    text-decoration: underline;
  }
`;

const FormLabelStyled = styled(Form.Label)`
  font-size: 14px;
  font-weight: 500;
  color: #344563;
  margin-bottom: 6px;
  margin-left: 6px;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email");
      setIsLoading(false);
      return;
    }

    try {
      await axiosClient.post(`/users/forgot-password`, { email });

      toast.success("Vui lòng kiểm tra email của bạn để lấy lại mật khẩu", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      // Chuyển hướng sau khi hiển thị toast
      setTimeout(() => {
        navigate(route.home);
      }, 3000);

      setErrorMessage("");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.Status) {
        setErrorMessage(error.response.data.Status);
        toast.error(error.response.data.Status);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        const message = "Có lỗi xảy ra, vui lòng thử lại sau";
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ForgotPasswordCard>
        <CardBodyStyled>
          <Title>Quên mật khẩu</Title>
          <Subtitle>
            Nhập email đã đăng ký để nhận hướng dẫn
            <br />
            khôi phục mật khẩu của bạn
          </Subtitle>

          {errorMessage && (
            <Alert
              variant="danger"
              className="mb-4"
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

          <Form onSubmit={handleSubmit}>
            <FormGroupStyled>
              <FormLabelStyled>Email</FormLabelStyled>
              <IconWrapper>
                <FaEnvelope />
              </IconWrapper>
              <FormControlWithIcon
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                required
              />
            </FormGroupStyled>

            <ButtonsContainer>
              <StyledButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span className="ms-2">Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <span>Tiếp tục</span>
                    <FaArrowRight />
                  </>
                )}
              </StyledButton>
            </ButtonsContainer>

            <LinkContainer>
              <StyledLink href={route.home}>Quay lại đăng nhập</StyledLink>
            </LinkContainer>
          </Form>
        </CardBodyStyled>
      </ForgotPasswordCard>
      <ToastContainer />
    </>
  );
};

export default ForgotPassword;
