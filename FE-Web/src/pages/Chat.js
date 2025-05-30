import React, { useState, useEffect, createContext, useRef } from "react";
import { Col, ListGroup } from "react-bootstrap";
import styled from "styled-components";
import Tab from "react-bootstrap/Tab";
import Stack from "react-bootstrap/Stack";
import axiosClient from "../api/axiosClient";

import SideBar from "../components/chat/SideBar";
import SearchBar from "../components/chat/SearchBar";
import ChatItem from "../components/chat/ChatItem";
import Header from "../components/chat/Main-Header";
import MessageList from "../components/chat/Main-MessageList";
import InputArea from "../components/chat/Main-InputArea";
import ConfirmDialog from "../components/chat/DialogMeeting";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_API_URL;
let socket = null; // Khởi tạo socket là null

const ChatMenu = () => (
  <ChatColStyled>
    <SideBar />
  </ChatColStyled>
);
const ChatList = (id) => (
  <ChatColStyled>
    <SearchBar />
    <ChatItemGroup id={id.id} />
  </ChatColStyled>
);

const MessageArea = ({ id }) => (
  <div
    className="flex-grow-1 border d-flex flex-column-reverse"
    style={{ backgroundColor: "#F1FFFA" }}
  >
    <MessageList id={id} socket={socket} />
  </div>
);

const ChatItemGroup = (id) => {
  const [chatItems, setChatItems] = useState([]);
  const [id2, setId] = useState();
  useEffect(() => {
    axiosClient.get("/info-chat-item").then((res) => {
      const data = res.data.data;
      const chatItems = data.map((item, index) => (
        <ChatItem key={index} data={item} socket={socket} />
      ));
      setChatItems(chatItems);
    });

    // Chỉ đăng ký event listener khi socket đã tồn tại
    if (!socket) return;

    // Xử lý tin nhắn mới bằng cách cập nhật id để trigger cập nhật danh sách chat
    const handleNewMessage = (message) => {
      setId(message);
    };

    socket.on("message", handleNewMessage);

    // Cleanup khi component unmount
    return () => {
      if (socket) {
        socket.off("message", handleNewMessage);
      }
    };
  }, [id, socket]); // Thêm socket vào dependencies

  return <StyledListGroup>{chatItems}</StyledListGroup>;
};
const ChatPane = ({ id }) => {
  return (
    <Tab.Pane eventKey={id} className="h-100">
      <Stack className="h-100">
        <Header id={id} socket={socket} />
        <MessageArea id={id} />
        <InputArea id={id} socket={socket} />
      </Stack>
    </Tab.Pane>
  );
};
const Chat = () => {
  const { id } = useParams();
  const [showMeeting, setShowMeeting] = useState(false);
  const [data, setData] = useState({}); // New state variable
  const [user, setUser] = useState({});
  const [messages, setMessages] = useState([]);
  const socketInitialized = useRef(false);
  const [socketError, setSocketError] = useState(false);

  // Khởi tạo socket một lần duy nhất khi component mount
  useEffect(() => {
    if (!socketInitialized.current && !socket) {
      try {
        socket = io(ENDPOINT, {
          reconnectionAttempts: 5, // Số lần thử kết nối lại
          reconnectionDelay: 1000, // Thời gian giữa các lần thử kết nối (ms)
          timeout: 10000, // Thời gian chờ kết nối (ms)
          transports: ["websocket", "polling"], // Cố gắng sử dụng WebSocket trước, fallback sang polling
        });
        socketInitialized.current = true;

        // Sự kiện kết nối thành công
        socket.on("connect", () => {
          console.log("Socket connected successfully");
          setSocketError(false);
          // Thiết lập user cho socket
          socket.emit("setup", localStorage.getItem("userId"));
        });

        // Xử lý lỗi kết nối
        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setSocketError(true);
        });

        // Xử lý ngắt kết nối
        socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          // Nếu server ngắt kết nối, thử kết nối lại
          if (reason === "io server disconnect") {
            socket.connect();
          }
        });

        // Khi thông tin user được thiết lập
        socket.on("setup", (user) => {
          console.log("Setup completed for user:", user);
        });

        // Dọn dẹp khi component unmount
        return () => {
          if (socket) {
            socket.disconnect();
            socket = null;
          }
          socketInitialized.current = false;
        };
      } catch (error) {
        console.error("Error initializing socket:", error);
        setSocketError(true);
        socketInitialized.current = false;
      }
    }
  }, []);

  // Tham gia phòng chat khi có id
  useEffect(() => {
    if (id && socket && socket.connected) {
      socket.emit("join chat", id, localStorage.getItem("userId"));
      console.log("Joining chat room:", id);
    }
  }, [id, socket?.connected]);

  // Hiển thị thông báo khi có lỗi socket
  useEffect(() => {
    if (socketError) {
      alert("Không thể kết nối đến server chat. Vui lòng làm mới trang!");
    }
  }, [socketError]);

  const handleClose = () => {
    if (!socket) return;
    socket.emit("decline", { meetingId: data.meetingId, userId: user._id });
    setShowMeeting(false);
  };

  const handleConfirm = () => {
    if (!socket) return;
    socket.emit("accept meeting", {
      meetingId: data.meetingId,
      userId: user._id,
    });
    window.open("/meeting2/" + data.meetingId, "_blank");
    setShowMeeting(false);
  };

  useEffect(() => {
    if (!id) return;
    axiosClient.get("/info-user/" + id).then((res) => {
      const data = res.data.data;
      setUser(data);
    });
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleNotify = (data) => {
      setData(data);
      setShowMeeting(true);
    };

    socket.on("notify", handleNotify);

    // Clean up the effect
    return () => {
      if (socket) {
        socket.off("notify", handleNotify);
      }
    };
  }, [socket]);

  // Ping server mỗi 30 giây để giữ kết nối
  useEffect(() => {
    if (!socket) return;

    const pingInterval = setInterval(() => {
      if (socket?.connected) {
        console.log("Sending ping to server...");
        socket.emit("ping");
      } else if (socket) {
        console.log("Socket not connected, reconnecting...");
        socket.connect();
      }
    }, 30000);

    // Nhận pong từ server
    socket.on("pong", () => {
      console.log("Received pong from server, connection is alive");
    });

    return () => {
      clearInterval(pingInterval);
      if (socket) {
        socket.off("pong");
      }
    };
  }, [socket]);

  // Thêm thông báo lỗi khi không thể kết nối
  if (socketError) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h4>Không thể kết nối đến server chat</h4>
          <p>Vui lòng kiểm tra kết nối mạng và làm mới trang.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Làm mới trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tab.Container id="list-group-tabs-example" defaultActiveKey={id}>
      <Container className="w-100 m-0">
        <FirstColumn>
          <ThirdColumn>
            <ChatMenu />
          </ThirdColumn>
          <FourthColumn>
            <ChatList id={id} />
          </FourthColumn>
        </FirstColumn>
        <SecondColumn>
          <Tab.Content className="h-100">
            {id ? <ChatPane eventKey={id} id={id} /> : <div></div>}
          </Tab.Content>
        </SecondColumn>
      </Container>
      <ConfirmDialog
        show={showMeeting}
        handleClose={handleClose}
        handleConfirm={handleConfirm}
      />
    </Tab.Container>
  );
};

const ChatColStyled = styled(Col)`
  margin: 0;
  padding: 0;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const FirstColumn = styled.div`
  flex: 0 0 auto;
  min-width: 70px;
  display: flex;
  box-sizing: border-box;
`;

const SecondColumn = styled.div`
  flex: 1 1 auto;
  box-sizing: border-box;
`;

const ThirdColumn = styled.div`
  flex: 1 1 80px;
  max-width: 80px;
  box-sizing: border-box;
`;

const FourthColumn = styled.div`
  flex: 1 1 350px;
  max-width: 350px;
  box-sizing: border-box;

  @media (max-width: 700px) {
    display: none;
  }
`;
const StyledListGroup = styled(ListGroup)`
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 0;
  scrollbar-width: thin;
  scrollbar-track-color: transparent;
  scrollbar-color: #dedede transparent;
  scroll-behavior: smooth;
`;
export default Chat;
