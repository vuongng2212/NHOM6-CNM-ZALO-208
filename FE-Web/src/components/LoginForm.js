import  React, { useContext, useState }  from "react";
import {Form, Button } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from "styled-components";
import { useNavigate } from 'react-router-dom';
import route from "../configs/route";
import {AuthToken} from '../authToken/index'

const FormStyled = styled(Form)`
  border: 1px solid var(--primary);
  padding: 20px;
`

const FormHeaderStyled = styled.h4`
  display: flex;
  justify-content: center;
  text-transform: uppercase;
  margin-bottom: 30px;
`

const LinkStyled = styled.a`
  margin-left:10px;
  text-decoration: none;
`
const LoginForm =() => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthToken);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  // const strongPasswordPattern = new RegExp(
  //   "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  // );
 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     const response = await login({ email, password });
    //  console.log(response);
     navigate(route.chat);
   } catch (err) {
     if (err.response) {
       // Các lỗi phát sinh bởi các yêu cầu không thành công
       setErrorMessage(err.response.data);
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
    <FormStyled  mStyled onSubmit={handleSubmit}>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <FormHeaderStyled>vui lòng đăng nhập</FormHeaderStyled>

      <FloatingLabel
        controlId="floatingInput"
        label="Nhập email của bạn"
        className="mb-3">
        <Form.Control
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}/>
      </FloatingLabel>

      <FloatingLabel
        controlId="floatingPassword"
        label="Mật khẩu"
        className="mb-3"
      >
        <Form.Control
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Form.Check
          type="checkbox"
          label="Hiển thị mật khẩu"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
        />
      </FloatingLabel>

      <Form.Group className="mb-3">
        <Button variant="primary" type="submit">
          Đăng nhập
        </Button>
        <Form.Group className="mt-3">
          Quên mật khẩu?
          <LinkStyled href={route.forgotPassword}>Đặt lại</LinkStyled>
        </Form.Group>
      </Form.Group>

      <Form.Group>
        Bạn chưa có tài khoản?
        <LinkStyled href={route.sendOtp}>Đăng ký</LinkStyled>
      </Form.Group>
    </FormStyled>
  );
}

export default LoginForm;
