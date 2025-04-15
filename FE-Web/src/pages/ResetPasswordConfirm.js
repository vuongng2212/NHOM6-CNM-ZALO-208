import React, { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import route from "../configs/route";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import OtpInput from "react-otp-input";

const ContainerStyled = styled(Container)`
  display: flex;
  justify-content: center;
`;

const FormGroupStyled = styled(Form.Group)`
  margin-bottom: 2rem;
  text-align: center;
`;

const ResetPasswordConfirm = () => {
 const [otp, setOtp] = useState("");
 const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

 const handleSubmit = async (e) => {
   e.preventDefault();

   // Lấy email từ sessionStorage
   const email = sessionStorage.getItem("email");

   // Kiểm tra xem email có tồn tại không
   if (!email) {
     alert("Không tìm thấy email. Vui lòng thử lại.");
     return;
   }

   // Kiểm tra xem OTP có hợp lệ không
   if (otp.length !== 6) {
     alert("OTP không hợp lệ");
     return;
   }

   // Gửi yêu cầu tới máy chủ
   try {
     const response = await axios.post(
      process.env.REACT_APP_API_URL + "/api/users/verify",
       {
         email,
         otp,
       }
     );

     // Kiểm tra xem email có tồn tại trong phản hồi từ máy chủ không
     if (response.data.hasOwnProperty("email")) {
       console.log("Email exists in the response:", response.data.email);
     } else {
       console.log("Email does not exist in the response");
     }

     alert("OTP đã được xác minh thành công");
     navigate(route.register); // Chuyển hướng đến trang đăng kí
   } catch (error) {
     console.error("Error:", error);

     // Xử lý lỗi cụ thể từ máy chủ
     if (error.response && error.response.status === 400) {
       alert("Có lỗi xảy ra, dữ liệu gửi đi không hợp lệ");
     } else {
       alert("Có lỗi xảy ra, vui lòng thử lại sau");
     }
   }
 };

 const handleResend = async () => {
   // Lấy email từ sessionStorage
   const email = sessionStorage.getItem("email");

   // Kiểm tra xem email có tồn tại không
   if (!email) {
     alert("Không tìm thấy email. Vui lòng thử lại.");
     return;
   }

   // Gửi yêu cầu tới máy chủ
   try {
     const response = await axios.post(
      process.env.REACT_APP_API_URL + "/api/users/send-otp",
       {
         email,
       }
     );

     if (response.data.success) {
       alert("Mã OTP đã được gửi lại thành công");
     } else {
       alert("Có lỗi xảy ra, vui lòng thử lại sau");
     }
   } catch (error) {
     console.error("Error:", error);
     alert("Có lỗi xảy ra, vui lòng thử lại sau");
   }
 };


  return (
    <ContainerStyled fluid="md">
      <Form onSubmit={handleSubmit}>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <FormGroupStyled>
          <h3>Nhập mã xác nhận</h3>
          <Form.Text>
            Mã xác thực sẽ được gửi qua email hoặc số điện thoại
          </Form.Text>
        </FormGroupStyled>

        <FormGroupStyled>
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            inputStyle={{
              height: "3rem",
              margin: " 0 1rem",
              fontSize: "3rem",
              borderRadius: "4px",
              border: " unset",
              borderBottom: "1px solid rgba(0,0,0,1)",
            }}
            renderSeparator={<span>-</span>}
            renderInput={(props) => <input {...props} />}
          />
        </FormGroupStyled>

        <FormGroupStyled>
          <p>Bạn chưa nhận được?</p>
          <Button variant="link" onClick={handleResend}>
            Gửi lại
          </Button>
        </FormGroupStyled>

        <FormGroupStyled>
          <Button variant="primary" type="submit">
            Tiếp theo
          </Button>
        </FormGroupStyled>
      </Form>
    </ContainerStyled>
  );
};

export default ResetPasswordConfirm;
