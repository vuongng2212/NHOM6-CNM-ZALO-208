import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import SideBar from "../components/chat/SideBar";
import axiosClient from "../api/axiosClient";
import { TextCenter } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";

const RecallFriendRequest = () => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get("/getAllCancelFriendRequest");
      // console.log(res.data);
      setFriends(res.data.data); // Assuming the data is nested under 'data' key
    } catch (error) {
      console.error(error);
      // Handle error if needed
    }
  };

  const handleCancelFriendRequest = async (friendId) => {
    try {
      const res = await axiosClient.post("/cancel-friend-request", {
        friendId,
      });
      // console.log(res.data);
      // After cancelling the friend request, refetch the data
      fetchData();
    } catch (error) {
      console.error(error);
      // Handle error if needed
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
            <h1 TextCenter>Danh sách lời mời kết bạn đã gửi</h1>
          </Row>
          <div style={{ overflowY: "auto", maxHeight: "730px" }}>
            {friends.map((friend, index) => (
              <Row key={index}>
                <Card className="mb-3">
                  <Row>
                    <Col
                      md={2}
                      className="d-flex align-items-center justify-content-center p-0"
                    >
                      <Card.Img
                        variant="top"
                        src={friend.avatar}
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "50px",
                        }}
                      />
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title>{friend.name}</Card.Title>
                        <Card.Text>Email: {friend.email}</Card.Text>
                        <Card.Text>Số điện thoại: {friend.phone}</Card.Text>
                      </Card.Body>
                    </Col>
                    <Col
                      md={2}
                      className="d-flex align-items-center justify-content-center p-0"
                    >
                      <Button
                        variant="danger"
                        onClick={() => handleCancelFriendRequest(friend._id)}
                      >
                        Huỷ lời mời kết bạn đã gửi
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Row>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RecallFriendRequest;
