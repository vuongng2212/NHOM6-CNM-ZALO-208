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

const ErrorNotification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1050;
  max-width: 300px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatItem = (item) => {
  const [lastMessage, setLastMessage] = useState(item.data.lastMessage);
  const [showNetworkError, setShowNetworkError] = useState(false);

  // Cập nhật lastMessage khi props thay đổi
  useEffect(() => {
    setLastMessage(item.data.lastMessage);

    // Lắng nghe sự kiện message từ socket
    if (item.socket) {
      const handleNewMessage = (message) => {
        // Kiểm tra nếu tin nhắn thuộc về chat room này
        if (message.chatRoomId === item.data.idChatRoom) {
          // Cập nhật tin nhắn mới nhất
          setLastMessage({
            text: message.content || "",
            createAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
      };

      // Đăng ký lắng nghe sự kiện message
      item.socket.on("message", handleNewMessage);

      // Lắng nghe sự kiện lỗi kết nối
      const handleConnectError = (error) => {
        console.error("Socket connection error:", error);
        setShowNetworkError(true);
        // Tự động ẩn thông báo sau 5 giây
        setTimeout(() => setShowNetworkError(false), 5000);
      };

      item.socket.on("connect_error", handleConnectError);

      // Kiểm tra tình trạng kết nối khi component mount
      if (!item.socket.connected) {
        setShowNetworkError(true);
        // Tự động ẩn thông báo sau 5 giây
        setTimeout(() => setShowNetworkError(false), 5000);
      }

      // Hủy đăng ký khi component unmount
      return () => {
        item.socket.off("message", handleNewMessage);
        item.socket.off("connect_error", handleConnectError);
      };
    }
  }, [item.data.lastMessage, item.data.idChatRoom, item.socket]);

  // Hàm để đóng thông báo lỗi thủ công
  const dismissError = () => {
    setShowNetworkError(false);
  };

  return (
    <>
      {showNetworkError && (
        <ErrorNotification>
          <span>
            Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng của bạn
          </span>
          <button onClick={dismissError} className="btn-close btn-sm"></button>
        </ErrorNotification>
      )}
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
          <div className="fw-bold">{item.data.name}</div>
          <div
            style={{
              fontWeight: item.data.unreadMessageCount === 0 ? "0" : "600",
            }}
          >
            {lastMessage && lastMessage.text && lastMessage.text.length > 12
              ? lastMessage.text.substring(0, 11) + "..."
              : lastMessage && lastMessage.text}
          </div>
        </div>
        <div className="d-flex flex-column">
          <span className="p-1" style={{ fontSize: "12px" }}>
            {lastMessage && lastMessage.createAt}
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
    </>
  );
};

export default ChatItem;
