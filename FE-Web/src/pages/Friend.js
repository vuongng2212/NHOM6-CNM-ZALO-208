import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideBar from "../components/chat/SideBar";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";

const FriendList = () => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axiosClient.get("/getAllFriend");
            // console.log(res.data);
            setFriends(res.data);
        }
        fetchData();
    }, []);

    const handleUnfriend = async (friendId) => {
        try {
            const res = await axiosClient.post("/unfriend", { friendId });
            // console.log(res.data);
            const updatedFriends = friends.filter((friend) => friend._id !== friendId);
            setFriends(updatedFriends);
        } catch (error) {
            console.error("Error unfriending:", error);
        }
    };

    return (
        <Container fluid className="m-0 p-0">
            <Row>
                <Col md={1} style={{ width: "101px" }}>
                    <SideBar />
                </Col>
                <Col md={11}>
                    <Button variant="light" onClick={() => navigate(-1)} className="mb-3">
                        <ArrowLeft /> Back
                    </Button>
                    <Row>
                        <h1>Danh sách bạn bè</h1>
                    </Row>
                    <div style={{ overflowY: "auto", maxHeight: "630px" }}>
                        <Row>
                            {friends.map((friend, index) => (
                              <Col key={index} md={6}>

                                <Card className="mb-3 w-100">
                                    <Row className="justify-content-around">
                                        <Col
                                            md={2}
                                            className="d-flex align-items-center justify-content-center p-0"
                                            >
                                            <Card.Img
                                                variant="top"
                                                src={friend.photoURL}
                                                style={{
                                                    width: "70px",
                                                    height: "70px",
                                                    borderRadius: "50px",
                                                  }}
                                                  />
                                        </Col>
                                        <Col md={6}>
                                            <Card.Body>
                                                <Card.Title>{friend.displayName}</Card.Title>
                                                <Card.Text>Email: {friend.email}</Card.Text>
                                                <Card.Text>Số điện thoại: {friend.phoneNumber}</Card.Text>
                                            </Card.Body>
                                        </Col>
                                        <Col
                                            md={2}
                                            className="d-flex align-items-center justify-content-center p-0"
                                            >
                                            <Button
                                                variant="danger"
                                                onClick={() => handleUnfriend(friend._id)}
                                                >
                                                Huỷ kết bạn
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card>
                              </Col>
                            ))}
                        </Row>
                    </div>
                </Col>
            </Row>
            </Container>
    );
};

export default FriendList;
