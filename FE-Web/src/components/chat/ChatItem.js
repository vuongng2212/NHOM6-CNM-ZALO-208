import React, { useState, useEffect } from "react";
import { ListGroup, Badge, Image } from "react-bootstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";

const ImageSidebarStyled = styled(Image)`
  width: 50px;
  height: 50px;
  margin: 0 15px;
`;

const DivImage = styled.div`
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 0 3px 0;
`;

const ChatItem = (item) => {
  const [lastMessage, setLastMessage] = useState(item.data.lastMessage);
  // console.log(item.data);
  useEffect(() => {
    setLastMessage(item.data.lastMessage);
  });

  // console.log("socket", socket);
  // const [lastMessage, setLastMessage] = useState(item.data.lastMessage);
  // useEffect(() => {
  //   // socket.on('message', (message) => {
  //   //   setLastMessage(message);
  //   // });
  //   setLastMessage(item.data.lastMessage);
  // }, [lastMessage]);
  return (
    <ListGroup.Item
      as={Link}
      to={`/messages/${item.data.idChatRoom}`}
      // link={index[1]}
      className="d-flex justify-content-between align-items-start border-0 px-2 py-3"
      action={true}
      eventKey={item.data.idChatRoom}
    >
      <DivImage>
        <ImageSidebarStyled
          src={
            item.data.photoURL
              ? item.data.photoURL
              : "https://res.cloudinary.com/dfvuavous/image/upload/v1744729521/mh7yvzr5xtsta96uyh1q.jpg"
          }
          alt={`${item.data.name}`}
          roundedCircle
        />
      </DivImage>
      <div className="me-auto">
        <div
          className="fw-bold"
          style={{
            fontWeight: item.data.unreadMessageCount > 0 ? "bold" : "normal",
            color: item.data.unreadMessageCount > 0 ? "#0b7c82" : "inherit"
          }}
        >
          {item.data.name}
          {item.data.unreadMessageCount > 0 && (
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                background: "red",
                borderRadius: "50%",
                marginLeft: 8,
                verticalAlign: "middle"
              }}
            ></span>
          )}
        </div>
        <div
          style={{
            fontWeight: item.data.unreadMessageCount > 0 ? "600" : "400",
          }}
        >
          {lastMessage.text.length > 12
            ? lastMessage.text.substring(0, 11) + "..."
            : lastMessage.text}
        </div>
      </div>
      <div className="d-flex flex-column">
        <span className="p-1" style={{ fontSize: "12px" }}>
          {lastMessage.createAt}
        </span>
        <div className="d-flex justify-content-end align-items-center">
          {item.data.unreadMessageCount === 0 ? (
            ""
          ) : (
            <Badge
              bg="danger"
              pill
              style={{ fontSize: "9px", padding: "4px 6px", margin: "5px" }}
            >
              {item.data.unreadMessageCount}
            </Badge>
          )}
        </div>
      </div>
      <style>
        {`
          .list-group-item.active {
            background-color:rgb(11, 124, 130);
            color: #444444;
            margin: 0 !important;
          }
        `}
      </style>
    </ListGroup.Item>
  );
};

export default ChatItem;
