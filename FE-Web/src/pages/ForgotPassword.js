import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import axiosClient from "../api/axiosClient";

const ContainerStyled = styled(Container)`
  display: flex;
  justify-content: center;
`;

const FormGroupStyled = styled(Form.Group)`
  margin-bottom: 2rem;
  text-align: center;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Thêm state để lưu lỗi

  const handleSubmit = async (event) => {
    // Chuyển thành hàm async
    event.preventDefault();
    try {
      await axiosClient.post(`/users/forgot-password`, {
        email,
      });
      alert("Vui lòng kiểm tra email của bạn");
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
      <Form onSubmit={handleSubmit}>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}{" "}
        {/* Hiển thị lỗi */}
        <FormGroupStyled>
          <h4>Khôi phục mật khẩu Meme để kết nối với ứng dụng</h4>
        </FormGroupStyled>
        <FormGroupStyled>
          <h1 style={{ color: "var(--primary)" }}>MEME</h1>
        </FormGroupStyled>
        <FormGroupStyled controlId="resetPasswordPhone">
          <Form.Control
            size="lg"
            type="text"
            name="resetPasswordPhone"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          />
        </FormGroupStyled>
        <FormGroupStyled>
          <Row>
            <Col>
              <Button variant="primary" type="submit">
                Tiếp theo
              </Button>
            </Col>
          </Row>
        </FormGroupStyled>
      </Form>
    </ContainerStyled>
  );
};

export default ForgotPassword;
