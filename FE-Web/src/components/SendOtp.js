import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import styled from "styled-components";
import route from "../configs/route";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

const OtpCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 440px;
  background: #fff;
  border: none;
`;

const CardBodyStyled = styled(Card.Body)`
  padding: 40px 32px;
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
  padding: 12px;
  font-weight: 600;
  font-size: 15px;
  background-color: #0068ff;
  border: none;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  &:hover,
  &:focus {
    background-color: #0051cc;
  }

  &:active {
    background-color: #004299;
  }
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

const SendOtp = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/send-otp",
        { email }
      );

      if (response.data.success === false) {
        setErrorMessage(response.data.message);
        toast.error(response.data.message, {
          position: "top-right",
        });
      } else {
        sessionStorage.setItem("email", email);

        toast.success("Mã xác nhận đã được gửi đến email của bạn!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });

        // Chuyển hướng sau khi hiển thị toast
        setTimeout(() => {
          navigate(route.resetPasswordConfirm);
        }, 3000);

        setErrorMessage("");
      }
    } catch (err) {
      if (err.response) {
        setErrorMessage(err.response.data.message);
        toast.error(err.response.data.message, {
          position: "top-right",
        });
      } else if (err.request) {
        const message =
          "Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng của bạn.";
        setErrorMessage(message);
        toast.error(message, {
          position: "top-right",
        });
      } else {
        setErrorMessage(err.message);
        toast.error(err.message, {
          position: "top-right",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <OtpCard>
        <CardBodyStyled>
          <Title>Đăng ký</Title>
          <Subtitle>
            Nhập email của bạn để nhận mã xác thực
            <br />
            và bắt đầu tạo tài khoản Zalo
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
                required
              />
            </FormGroupStyled>

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
                  <FaPaperPlane />
                  <span>Gửi mã xác nhận</span>
                </>
              )}
            </StyledButton>

            <LinkContainer>
              <StyledLink href={route.home}>Quay lại đăng nhập</StyledLink>
            </LinkContainer>
          </Form>
        </CardBodyStyled>
      </OtpCard>
      <ToastContainer />
    </>
  );
};

export default SendOtp;
