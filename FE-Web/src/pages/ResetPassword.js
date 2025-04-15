import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import route from "../configs/route";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import validator from "validator";

const ContainerStyled = styled(Container)`
  display: flex;
  justify-content: center;
`;

const FormGroupStyled = styled(Form.Group)`
  margin-bottom: 2rem;
  text-align: center;
`;

const ResetPassword = () => {
  const navigate = useNavigate();
  const { id, token } = useParams();
  const [errorMessage, setErrorMessage] = useState(""); // Thêm state để lưu lỗi
const [password, setPassword] = useState("");
const [passwordError, setPasswordError] = useState("");
  const handleSubmit = async (e) => {
    // Chuyển thành hàm async
    e.preventDefault();
     if (!validator.isStrongPassword(password)) {
       setPasswordError("Mật khẩu phải mạnh");
       return;
     }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/reset-password/${id}/${token}`,
        {
          password,
        }
      );
      alert("Đổi mật khẩu thành công");
      navigate(route.home);
    } catch (error) {
      // Xử lý lỗi từ BE
      if (error.response && error.response.data && error.response.data.Status) {
        setErrorMessage(error.response.data.Status);
      } else {
        setErrorMessage("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    }
  };

  return (
    <ContainerStyled fluid="md">
      <Form onSubmit={handleSubmit} style={{ width: "40%" }}>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}{" "}
        {/* Hiển thị lỗi */}
        <FormGroupStyled>
          <h3>Đặt lại mật khẩu</h3>
        </FormGroupStyled>
        <FormGroupStyled>
          <Form.Control
            size="lg"
            type="password"
            name="password"
            placeholder="Nhập mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={!!passwordError}
          />
          <Form.Control.Feedback type="invalid">
            {passwordError}
          </Form.Control.Feedback>
        </FormGroupStyled>
        <FormGroupStyled>
          <Button variant="primary" type="submit">
            Xác nhận
          </Button>
        </FormGroupStyled>
      </Form>
    </ContainerStyled>
  );
};

export default ResetPassword;