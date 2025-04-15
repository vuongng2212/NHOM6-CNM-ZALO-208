import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import styled from "styled-components";
import route from "../configs/route";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaCalendarAlt, FaLock } from "react-icons/fa";

const RegisterCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  width: 100%;
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
  margin-bottom: 16px;
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #7589a3;
  font-size: 16px;
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 12px;
  font-weight: 600;
  font-size: 15px;
  background-color: #0068ff;
  border: none;
  margin-top: 16px;
  width: 100%;

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

const RegisterForm = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [registerData, setRegisterData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Lấy dữ liệu từ sessionStorage khi component được load
    const email = sessionStorage.getItem("email");
    if (email) {
      setRegisterData({ email });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + `/api/users/register`,
        {
          email: registerData.email,
          password,
          displayName,
          dateOfBirth,
        }
      );

      // Thay alert bằng toast
      toast.success(
        "Đăng ký tài khoản thành công! Chuyển hướng đến trang đăng nhập...",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Chuyển hướng sau khi hiển thị toast
      setTimeout(() => {
        navigate(route.home);
      }, 3000);

      setErrorMessage("");
    } catch (err) {
      if (err.response) {
        // Các lỗi phát sinh bởi các yêu cầu không thành công
        setErrorMessage(err.response.data.message);
        toast.error(err.response.data.message, {
          position: "top-right",
        });
      } else if (err.request) {
        // Các lỗi phát sinh do yêu cầu không được gửi
        const message =
          "Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng của bạn";
        setErrorMessage(message);
        toast.error(message, {
          position: "top-right",
        });
      } else {
        // Các lỗi khác
        setErrorMessage(err.message);
        toast.error(err.message, {
          position: "top-right",
        });
      }
    }
  };

  return (
    <>
      <RegisterCard>
        <CardBodyStyled>
          <Title>Đăng ký</Title>
          <Subtitle>
            Tạo tài khoản Zalo mới
            <br />
            để trải nghiệm tính năng tuyệt vời
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
              <FormLabelStyled>Tên tài khoản</FormLabelStyled>
              <IconWrapper>
                <FaUser />
              </IconWrapper>
              <FormControlWithIcon
                placeholder="Nhập tên của bạn"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </FormGroupStyled>

            <FormGroupStyled>
              <FormLabelStyled>Ngày sinh</FormLabelStyled>
              <IconWrapper>
                <FaCalendarAlt />
              </IconWrapper>
              <FormControlWithIcon
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </FormGroupStyled>

            <FormGroupStyled>
              <FormLabelStyled>Mật khẩu</FormLabelStyled>
              <IconWrapper>
                <FaLock />
              </IconWrapper>
              <FormControlWithIcon
                type="password"
                placeholder="Nhập mật khẩu mạnh"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                title="Mật khẩu cần có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
                required
              />
              <small className="form-text text-muted ms-2">
                Mật khẩu cần có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và
                số
              </small>
            </FormGroupStyled>

            <StyledButton type="submit">Đăng ký</StyledButton>

            <LinkContainer>
              Bạn đã có tài khoản?{" "}
              <StyledLink href={route.home}>Đăng nhập</StyledLink>
            </LinkContainer>
          </Form>
        </CardBodyStyled>
      </RegisterCard>
      <ToastContainer />
    </>
  );
};

export default RegisterForm;
