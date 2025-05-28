import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import styled from "styled-components";
import route from "../configs/route";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import validator from "validator";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLock, FaCheck } from "react-icons/fa";

const ResetPasswordCard = styled(Card)`
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
  padding: 12px 16px 12px 44px;
  border-radius: 24px;
  border: 1px solid #dfe1e6;
  font-size: 14px;
  height: auto;
  background-color: #f1f3f5;
  position: relative;

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
  z-index: 1;
  display: flex;
  align-items: center;
  pointer-events: none;
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

const PasswordRequirements = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin-top: 8px;
  font-size: 12px;
  color: #7589a3;

  li {
    margin-bottom: 4px;

    &.valid {
      color: #36b37e;
    }

    &::before {
      content: "•";
      margin-right: 8px;
    }
  }
`;

const FormLabelStyled = styled(Form.Label)`
  font-size: 14px;
  font-weight: 500;
  color: #344563;
  margin-bottom: 6px;
  margin-left: 6px;
`;

const ResetPassword = () => {
  const navigate = useNavigate();
  const { id, token } = useParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Kiểm tra các yêu cầu mật khẩu
  const hasLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validator.isStrongPassword(password)) {
      toast.error("Mật khẩu phải đáp ứng tất cả các yêu cầu");
      setIsLoading(false);
      return;
    }

    if (!passwordsMatch) {
      toast.error("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/reset-password/${id}/${token}`,
        { password }
      );

      if (response.data.Status === "Success") {
        toast.success(
          "Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );

        setTimeout(() => {
          navigate(route.home);
        }, 3000);
      } else {
        setErrorMessage(response.data.Status || "Có lỗi xảy ra");
        toast.error(response.data.Status || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.Status) {
        setErrorMessage(error.response.data.Status);
        toast.error(error.response.data.Status);
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
      <ResetPasswordCard>
        <CardBodyStyled>
          <Title>Đặt lại mật khẩu</Title>
          <Subtitle>Tạo mật khẩu mới cho tài khoản của bạn</Subtitle>

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
              <FormLabelStyled>Mật khẩu mới</FormLabelStyled>
              <div style={{ position: "relative" }}>
                <IconWrapper>
                  <FaLock />
                </IconWrapper>
                <FormControlWithIcon
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <PasswordRequirements>
                <li className={hasLength ? "valid" : ""}>Ít nhất 8 ký tự</li>
                <li className={hasUpperCase ? "valid" : ""}>
                  Ít nhất 1 chữ hoa
                </li>
                <li className={hasLowerCase ? "valid" : ""}>
                  Ít nhất 1 chữ thường
                </li>
                <li className={hasNumber ? "valid" : ""}>Ít nhất 1 số</li>
              </PasswordRequirements>
            </FormGroupStyled>

            <FormGroupStyled>
              <FormLabelStyled>Xác nhận mật khẩu</FormLabelStyled>
              <div style={{ position: "relative" }}>
                <IconWrapper>
                  <FaLock />
                </IconWrapper>
                <FormControlWithIcon
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {confirmPassword && (
                <div
                  style={{
                    fontSize: "12px",
                    marginTop: "8px",
                    color: passwordsMatch ? "#36B37E" : "#FF5630",
                  }}
                >
                  {passwordsMatch ? "✓ Mật khẩu khớp" : "✗ Mật khẩu không khớp"}
                </div>
              )}
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
                    <span className="ms-2">Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FaCheck />
                    <span>Xác nhận</span>
                  </>
                )}
              </StyledButton>
            </ButtonsContainer>
          </Form>
        </CardBodyStyled>
      </ResetPasswordCard>
      <ToastContainer />
    </>
  );
};

export default ResetPassword;
