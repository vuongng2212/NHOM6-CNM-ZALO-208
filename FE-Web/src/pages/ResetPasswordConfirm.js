import React, { useEffect, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import styled from "styled-components";
import route from "../configs/route";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OtpInput from "react-otp-input";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPaperPlane, FaArrowRight } from "react-icons/fa";

const OtpCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 500px;
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

const OtpWrapper = styled.div`
  margin: 24px 0;
  display: flex;
  justify-content: center;
`;

const CustomOtpInput = styled(OtpInput)`
  gap: 10px;
  justify-content: center;
`;

const ResendText = styled.p`
  text-align: center;
  font-size: 14px;
  color: #7589a3;
  margin-bottom: 8px;
`;

const ResendLink = styled(Button)`
  background: none;
  border: none;
  color: #0068ff;
  font-weight: 500;
  padding: 0;
  font-size: 14px;

  &:hover,
  &:focus {
    background: none;
    color: #0051cc;
    text-decoration: underline;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
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
  min-width: 180px;

  &:hover,
  &:focus {
    background-color: #0051cc;
  }

  &:active {
    background-color: #004299;
  }
`;

const ResendContainer = styled.div`
  text-align: center;
  margin: 16px 0 24px 0;
`;

const ResetPasswordConfirm = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const email = sessionStorage.getItem("email");

    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng thử lại.");
      setIsLoading(false);
      return;
    }

    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số của mã xác thực");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/verify",
        { email, otp }
      );

      toast.success("Xác thực OTP thành công! Đang chuyển hướng...", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate(route.register);
      }, 3000);
    } catch (error) {
      console.error("Error:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
        toast.error(error.response.data.message);
      } else if (error.response && error.response.status === 400) {
        const message = "OTP không chính xác hoặc đã hết hạn";
        setErrorMessage(message);
        toast.error(message);
      } else {
        const message = "Có lỗi xảy ra, vui lòng thử lại sau";
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    const email = sessionStorage.getItem("email");

    if (!email) {
      toast.error("Không tìm thấy email. Vui lòng thử lại.");
      setResendLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "/api/users/send-otp",
        { email }
      );

      if (response.data.success !== false) {
        toast.success("Mã OTP mới đã được gửi đến email của bạn", {
          position: "top-right",
        });
        setCountdown(60); // 60 giây đếm ngược
      } else {
        toast.error(
          response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <OtpCard>
        <CardBodyStyled>
          <Title>Xác nhận mã OTP</Title>
          <Subtitle>
            Vui lòng nhập mã xác thực 6 chữ số
            <br />
            đã được gửi đến email của bạn
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
            <OtpWrapper>
              <CustomOtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                inputStyle={{
                  width: "48px",
                  height: "48px",
                  fontSize: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid #dfe1e6",
                  backgroundColor: "#f1f3f5",
                  margin: "0 4px",
                  textAlign: "center",
                  fontWeight: "600",
                  color: "#0068ff",
                  outline: "none",
                }}
                inputType="number"
                renderSeparator={""}
                renderInput={(props) => <input {...props} />}
                shouldAutoFocus={true}
              />
            </OtpWrapper>

            <ResendContainer>
              <ResendText>Chưa nhận được mã?</ResendText>
              {countdown > 0 ? (
                <span style={{ fontSize: "14px", color: "#7589a3" }}>
                  Gửi lại sau {countdown}s
                </span>
              ) : (
                <ResendLink onClick={handleResend} disabled={resendLoading}>
                  {resendLoading ? "Đang gửi..." : "Gửi lại mã xác nhận"}
                </ResendLink>
              )}
            </ResendContainer>

            <ButtonsContainer>
              <StyledButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span className="ms-2">Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Tiếp tục</span>
                    <FaArrowRight />
                  </>
                )}
              </StyledButton>
            </ButtonsContainer>
          </Form>
        </CardBodyStyled>
      </OtpCard>
      <ToastContainer />
    </>
  );
};

export default ResetPasswordConfirm;
