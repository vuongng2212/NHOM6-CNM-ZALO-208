import  React  from "react";
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from "../components/LoginForm";
import AuthProvider from '../authToken/index';
import Benefit from "../components/Benefit";

const Home =() => {
    return (
        <Container fluid="md">
            <Row className="align-items-center">
                <Col md="5">
                    <AuthProvider>
                        <LoginForm/>
                    </AuthProvider>
                </Col>
                <Col md="1">
                </Col>
                <Col >
                    <Benefit/>
                </Col>
            </Row>
        </Container>
    )
}

export default Home;
