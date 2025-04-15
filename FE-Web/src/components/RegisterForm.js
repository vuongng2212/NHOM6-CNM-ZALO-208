import React, { useState, useEffect } from "react";
import {Col, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import route from "../configs/route";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FormStyled = styled(Form)`
  border: 1px solid var(--primary);
  padding: 20px;
`;

const LinkStyled = styled.a`
  margin-left: 10px;
  text-decoration: none;
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
    // console.log(response);
    alert("Đăng ký tài khoản thành công");
    setTimeout(() => {
      navigate(route.home);
    }, 50);
    // Nếu không có lỗi, đặt lại errorMessage thành chuỗi rỗng
    setErrorMessage("");
  } catch (err) {
    if (err.response) {
      // Các lỗi phát sinh bởi các yêu cầu không thành công
      setErrorMessage(err.response.data.message);
    } else if (err.request) {
      // Các lỗi phát sinh do yêu cầu không được gửi
      setErrorMessage(
        "Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng của bạn"
      );
    } else {
      // Các lỗi khác
      setErrorMessage(err.message);
    }
  }
};




  return (
    <FormStyled onSubmit={handleSubmit}>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <Form.Group className="mb-3" as={Col} controlId="registerDisplayName">
        <Form.Label>Tên tài khoản</Form.Label>
        <Form.Control
          placeholder="David Nguyen"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group as={Col} controlId="registerDateInput" className="mb-3">
        <Form.Label>Ngày sinh</Form.Label>
        <Form.Control
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="registerPassword">
        <Form.Label>Mật khẩu</Form.Label>
        <Form.Control
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          //ràng buộc mật khẩu mạnh:
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Đăng ký
      </Button>
      <Form.Group className="mt-3">
        Bạn đã có tài khoản?
        <LinkStyled href={route.home}>Đăng nhập</LinkStyled>
      </Form.Group>
    </FormStyled>
  );
};

export default RegisterForm;
