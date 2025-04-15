import React from "react";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import FriendRequest from "../components/FriendRequest";

const ListFriendRequest = () => {
  return (
    <Container fluid="md-1">
      <FriendRequest />
    </Container>
  );
};

export default ListFriendRequest;
