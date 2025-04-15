import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import route from "../configs/route";
import axios from "axios";

const FormStyled = styled(Form)`
  border: 1px solid var(--primary);
  padding: 20px;
`;

const FormHeaderStyled = styled.h4`
  display: flex;
  justify-content: center;
  text-transform: uppercase;
  margin-bottom: 30px;
`;

const SendOtp = () => {

const [email, setEmail] = useState("");
const navigate = useNavigate();
const [errorMessage, setErrorMessage] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log(process.env.REACT_APP_API_URL + "/api/users/send-otp");
    const response = await axios.post(
      process.env.REACT_APP_API_URL + "/api/users/send-otp",
      {
        email,
      }
    );
    if (response.data.success === false) {
      setErrorMessage(response.data.message);
    } else {
      sessionStorage.setItem("email", email);
      // console.log(sessionStorage);
      alert("Vui lòng kiểm tra mã xác nhận đã gửi qua email của bạn");
      navigate(route.resetPasswordConfirm);
      setErrorMessage("");
    }
  } catch (err) {
    if (err.response) {
      // Các lỗi phát sinh bởi các yêu cầu không thành công
      setErrorMessage(err.response.data.message);
    } else if (err.request) {
      // Các lỗi phát sinh do yêu cầu không được gửi
      setErrorMessage(
        "Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng của bạn."
      );
    } else {
      // Các lỗi khác
      setErrorMessage(err.message);
    }
  }
};
  return (
    <FormStyled onSubmit={handleSubmit}>
      <FormHeaderStyled>vui lòng đăng kí</FormHeaderStyled>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <FloatingLabel
        controlId="floatingInput"
        label="Nhập Email "
        className="mb-3"
      >
        <Form.Control
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FloatingLabel>
      <Form.Group className="mb-3">
        <Button variant="primary" type="submit">
          Gửi mã xác nhận
        </Button>
      </Form.Group>
    </FormStyled>
  );
};

export default SendOtp;
