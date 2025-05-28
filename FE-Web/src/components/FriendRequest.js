import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Dropdown } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import styled from "styled-components";
import SideBar from "../components/chat/SideBar";
import SearchBar from "../components/chat/SearchBar";
import axiosClient from "../api/axiosClient";
import { AuthToken } from "../authToken";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ContactCard = styled(Card)`
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ContactInfo = styled.div`
  flex-grow: 1;
`;

const ContactName = styled.h4`
  font-weight: bold;
  margin-bottom: 5px;
`;

const ContactEmail = styled.p`
  color: #606770;
  margin-bottom: 5px;
`;

const ContactPhone = styled.p`
  color: #606770;
`;

const Avatar = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
`;

const FriendRequest = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const { user } = useContext(AuthToken);

  useEffect(() => {
    const getFriendRequestList = async () => {
      try {
        const response = await axiosClient.get("/getAllFriendRequest");
        const friendRequests = response.data.data;
        const extractedData = friendRequests.map((friend) => ({
          username: friend.name,
          email: friend.email,
          phoneNumber: friend.phone,
          gender: friend.gender,
          avatar: friend.avatar, // Assuming `photoURL` contains the URL to the avatar
        }));
        setContacts(extractedData);
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
      }
    };
    getFriendRequestList();
  }, [user]);

  const handleAction = async (action, email) => {
    try {
      if (action === "delete") {
        await axiosClient.post("/decline-friend-request", { email });
      } else if (action === "addFriend") {
        await axiosClient.post("/accept-friend", { email });
      }
      setContacts(contacts.filter((contact) => contact.email !== email));
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
    }
  };

  return (
    <Container fluid className="m-0 p-0">
      <Row>
        <Col md={1} style={{ width: "101px" }}>
          <SideBar />
        </Col>
        <Col md={11}>
          <SearchBar />
          <Button variant="light" onClick={() => navigate(-1)} className="mb-3">
            <ArrowLeft /> Back
          </Button>
          <Row>
            <h1>Danh sách yêu cầu kết bạn</h1>
          </Row>
          <div style={{ overflowY: "auto", maxHeight: "730px" }}>
            <Row>
            {contacts.map((friend, index) => (
                <Col  key={index} md ={6}>
                  <ContactCard className="mb-3">
                    <Card.Body>
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
                        <Col md={7}>
                          <ContactInfo>
                            <ContactName>{friend.username}</ContactName>
                            <ContactEmail>Email: {friend.email}</ContactEmail>
                            <ContactPhone>
                              Số điện thoại: {friend.phoneNumber}
                            </ContactPhone>
                            <ContactPhone>
                              Giới tính: {friend.gender}
                            </ContactPhone>
                          </ContactInfo>
                        </Col>
                        <Col
                          md={2}
                          className="d-flex flex-column align-items-center justify-content-around p-0"
                        >
                          {/* <Dropdown>
                            <Dropdown.Toggle
                              variant="primary"
                              id="dropdown-basic"
                            >
                              Thao tác
                            </Dropdown.Toggle>
                            <Dropdown.Menu> */}
                              {/* <Dropdown.Item */}
                              <Button
                                onClick={() =>
                                  handleAction("addFriend", friend.email)
                                }
                              >
                                Accept
                              </Button>
                              {/* </Dropdown.Item> */}
                              {/* <Dropdown.Item */}
                              <Button variant="danger"
                                onClick={() =>
                                  handleAction("delete", friend.email)
                                }
                              >
                                Decline
                                </Button>
                              {/* </Dropdown.Item> */}
                            {/* </Dropdown.Menu>
                          </Dropdown> */}
                        </Col>
                      </Row>
                    </Card.Body>
                  </ContactCard>

                </Col>
            ))}
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FriendRequest;
