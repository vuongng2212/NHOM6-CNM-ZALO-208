import  React from "react";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import RegisterForm from "../components/RegisterForm";
import { images } from "../assets";

const Register = () => {
    return(
        <Container fluid="md">
            <Row>
                <Col md="4">
                    <h1 style={{color:"var(--primary)", marginBottom:"20px"}}>Đăng ký</h1>
                    <h3 style={{marginBottom:"50px"}}>Dễ dàng và nhanh chóng</h3>
                    <img src={images.globalConnect} style={{width:"100%"}}></img>
                </Col>
                <Col md="8">
                    <RegisterForm/>
                </Col>
            </Row>
        </Container>
    )
}

export default Register;