import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Image,
  Dropdown,
  Card,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import axiosClient from "../../api/axiosClient";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faReply } from "@fortawesome/free-solid-svg-icons";

import { useGlobalState } from "../../util/state";

const StyledListGroup = styled(ListGroup)`
  max-height: 83vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-track-color: transparent;
  scrollbar-color: #dedede transparent;
  padding: 15px;
  background-color: #f8f9fa;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.7) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.7) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &.sender {
    background-color: #0084ff;
    color: white;
    border-bottom-right-radius: 4px;
    align-self: flex-end;
  }

  &.receiver {
    background-color: #f1f0f0;
    color: #333;
    border-bottom-left-radius: 4px;
    align-self: flex-start;
  }

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const PinnedMessageContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  max-width: 90%;
  border-left: 4px solid #0084ff;
  overflow: hidden;
  transition: all 0.3s ease;

  .list-group-item {
    border: none;
    padding: 10px 15px;
    background: transparent;
  }

  .btn-outline-danger {
    border-radius: 20px;
    padding: 2px 10px;
    font-size: 0.8rem;
  }
`;

const MessageContainer = styled.div`
  .message-container::-webkit-scrollbar {
    width: 6px;
  }

  .message-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .message-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
  }
`;

const MediaContainer = styled.div`
  margin: 5px 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  max-width: 300px;

  img,
  video,
  embed {
    width: 100%;
    display: block;
    object-fit: contain;
  }

  .file-name {
    padding: 8px 12px;
    font-size: 0.9rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    color: #444;
  }
`;

const MessageActionBar = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 50px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 1000;
  transition: all 0.2s ease;
  opacity: 0.95;

  &.sender {
    right: 100%;
    margin-right: 10px;
  }

  &.receiver {
    left: 100%;
    margin-left: 10px;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: transparent;
    transition: all 0.2s ease;
    cursor: pointer;
    color: #555;

    &:hover {
      background-color: #f5f5f5;
      transform: scale(1.1);
    }
  }
`;

const ReactionMenu = styled(Dropdown.Menu)`
  background-color: white !important;
  border-radius: 50px !important;
  padding: 6px !important;
  min-width: auto !important;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15) !important;
  border: none !important;
  display: flex !important;

  .dropdown-item {
    padding: 8px !important;
    border-radius: 50% !important;
    margin: 0 2px !important;
    font-size: 18px !important;
    width: 40px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: transform 0.2s !important;

    &:hover {
      transform: scale(1.2) !important;
      background-color: #f5f5f5 !important;
    }
  }
`;

const MessageList = (id) => {
  var socket = id.socket;
  const [show, setShow] = useState(false);
  const [userInfo, setUserInfo] = useState([]);
  const [forwarded, setForwarded] = useState([]);
  const [messageId, setMessageId] = useState("");
  const handleClose = () => setShow(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isPinTableVisible, setIsPinTableVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPinTable, setShowPinTable] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState("");

  useEffect(() => {
    const fetchCurrentUserAvatar = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("userId"));
        if (userId) {
          const response = await axiosClient.get("/profile");
          if (response && response.data && response.data.data) {
            setCurrentUserAvatar(response.data.data.avatar);
          }
        }
      } catch (error) {
        console.error("Error fetching current user avatar:", error);
      }
    };

    fetchCurrentUserAvatar();
  }, []);

  const [replyMessage, setReplyMessage] = useGlobalState("replyMessage");
  // console.log("socket", socket);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (id.id) {
          const res = await axiosClient.get(`/messages/${id.id}`);
          // console.log("messages123123123: ", res.data.data)
          if (res.data.data || res.status === 200) {
            setMessages(res.data.data);
            // res.data.data.map(message=>{
            //   if(message.pin )
            //   setPinnedMessages([...pinnedMessages, message]);
            // })
            setPinnedMessages(res.data.data.filter((message) => message.pin));
          } else {
            setMessages([]);
          }
        }
      } catch (error) {
        setMessages([]);
        // console.error("MessageList: ", error);
      }
    };
    fetchMessages();
  }, [id.id]);

  const listGroupRef = useRef(null);
  useEffect(() => {
    if (listGroupRef.current) {
      listGroupRef.current.scrollTop = listGroupRef.current.scrollHeight;
    }
  }, [listGroupRef.current, messages]);

  useEffect(() => {
    // Xử lý tin nhắn mới và tránh tạo nhiều listener trùng lặp
    if (!socket) return; // Kiểm tra socket tồn tại

    const handleNewMessage = (message) => {
      const newMessage = {
        id: message.id,
        content: message.content,
        sent: message.senderId,
        reply: message.reply,
        senderName: message.senderName,
        avatarSender: message.avatarSender,
        time: message.time,
        type: message.type,
        media: message.media,
        pin: message.pin,
      };
      // Sử dụng functional update để tránh stale state
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    // Đăng ký listener một lần duy nhất
    socket.on("message", handleNewMessage);

    // Cleanup khi component unmount hoặc re-render
    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [socket]); // Chỉ phụ thuộc vào socket, không phụ thuộc vào messages

  const [showDropdownIndex, setShowDropdownIndex] = useState(null);
  // const pinTableRef = useRef(null);

  // // Scroll to pin-table when pin-table is clicked
  // const scrollToPinTable = () => {
  //   if (pinTableRef.current) {
  //     pinTableRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };
  const handleMouseEnter = (index) => {
    setShowDropdownIndex(index);
  };

  const handleMouseLeave = () => {
    setShowDropdownIndex(null);
  };

  const handlePinMessage = async (messageId, idChatRoom) => {
    try {
      // Check if the message is already pinned
      if (pinnedMessages.some((message) => message.id === messageId)) {
        // Message is already pinned, do not proceed
        return;
      }

      const response = await axiosClient.patch(`/pin-message/${messageId}`, {
        data: {
          chatRoomId: idChatRoom,
        },
      });
      if (response.status === 200) {
        // Update the UI to reflect the pinned message
        setMessages(
          messages.map((message) =>
            message.id === messageId ? { ...message, pin: true } : message
          )
        );

        // Add the pinned message to the pinnedMessages array
        const messageToAdd = messages.find(
          (message) => message.id === messageId
        );
        setPinnedMessages([...pinnedMessages, messageToAdd]);
        setShowPinTable(true);
      } else {
        // Handle other status codes if needed
      }
    } catch (error) {
      // Handle errors if the request fails
    }
  };

  const handleUnpin = async (messageId, idChatRoom) => {
    try {
      // Make a PATCH request to unpin the message
      const response = await axiosClient.patch(`/unpin-message/${messageId}`, {
        chatRoomId: idChatRoom,
      });

      // Check if the request was successful
      if (response.status === 200) {
        // Update pinnedMessages state to remove the message with the specified messageId
        setPinnedMessages((prevPinnedMessages) =>
          prevPinnedMessages.filter((message) => message.id !== messageId)
        );

        // Check if there's only one pinned message left after unpinning
        if (pinnedMessages.length === 1) {
          setIsPinTableVisible(false); // Hide the pin table if only one message is pinned
        }
      } else {
        // Handle unsuccessful response, maybe show an error message
        console.error("Failed to unpin message");
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error("Error unpinning message:", error);
    }
  };

  const handleDelete = async (messageId) => {
    const res = await axiosClient.delete(`/message/${messageId}`);
    if (res.status === 200)
      setMessages(messages.filter((message) => message.id !== messageId));

    //   socket.emit('delete message', { chatRoomId: id.id, messageId });
    //     socket.on('delete message', (message) => {
    //       console.log('delete message', message);
    //       setMessages(messages.filter(message => message.id !== message.id));
    //     });
    // }
  };
  const handleHide = async (messageId) => {
    const confirm = window.confirm(
      "Bạn có chắc chắn muốn ẩn tin nhắn này ở phía bạn?"
    );
    if (!confirm) return;
    const res = await axiosClient.patch(`/hide-message/${messageId}`);
    if (res.status === 200) {
      setMessages(
        messages.map((message) =>
          message.id === messageId ? { ...message, hided: true } : message
        )
      );
    }
  };
  const handleUnsend = async (messageId) => {
    // const confirm = window.confirm('Bạn có chắc chắn muốn thu hồi tin nhắn này?');
    // if (!confirm) return;
    if (!socket) return; // Kiểm tra socket tồn tại

    const res = await axiosClient.patch(`/unsent-message/${messageId}`);
    // if (res.status === 200) setMessages(messages.map(message => message.id === messageId ? { ...message, unsent: true } : message));
    if (res.status === 200)
      socket.emit("unsend message", { chatRoomId: id.id, messageId });
    // socket.on('unsend message', (a) => {
    //   console.log('unsend message', a);
    //   setMessages(messages.map(message => message.id === a.id ? { ...message, unsent: true } : message));
    // });
  };
  const handleForward = async (messageId) => {
    setForwarded([]);
    setMessageId(messageId);
    const res = await axiosClient.get("/info-chat-item/", {
      params: {
        chatRoomId: id.id,
      },
    });
    setUserInfo(res.data.data);
    // console.log(userInfo);
    setShow(true);
  };
  const handleSendForward = async (index, idChatRoom) => {
    if (!socket) return; // Kiểm tra socket tồn tại

    // console.log('forward message', messageId, idChatRoom);
    const res = await axiosClient.patch(`/forward-message/${messageId}`, {
      data: {
        chatRoomId: idChatRoom,
      },
    });
    // console.log('res', res);
    if (res.status === 200) {
      const data = {
        chatRoomId: idChatRoom,
        senderId: localStorage.getItem("userId"),
        content: res.data.data.content,
        type: res.data.data.type,
        media: res.data.data.media,
      };
      socket.emit("message", data, res.data.data._id);
    }
    setForwarded([...forwarded, index]);
  };

  useEffect(() => {
    if (!socket) return; // Kiểm tra socket tồn tại

    const handleUnsendMessage = (a) => {
      setMessages(
        messages.map((message) =>
          message.id === a.id ? { ...message, unsent: true } : message
        )
      );
    };

    socket.on("unsend message", handleUnsendMessage);

    return () => {
      socket.off("unsend message", handleUnsendMessage);
    };
  }, [messages, socket]);

  const handleReaction = async (reaction, messageId) => {
    if (!socket) return; // Kiểm tra socket tồn tại

    try {
      const res = await axiosClient.patch(`/react-message/${messageId}`, {
        data: {
          reaction,
        },
      });
      if (res.status === 200) {
        socket.emit("react message", {
          chatRoomId: id.id,
          messageId,
          reactions: res.data.data.reactions,
        });
      }
    } catch (error) {
      console.error("Error sending reaction:", error);
    }
  };

  useEffect(() => {
    if (!socket) return; // Kiểm tra socket tồn tại

    const handleReactMessage = (message) => {
      setMessages(
        messages.map((m) =>
          m.id === message.messageId
            ? { ...m, reactions: message.reactions }
            : m
        )
      );
    };

    socket.on("react message", handleReactMessage);

    return () => {
      socket.off("react message", handleReactMessage);
    };
  }, [messages, socket]);

  const convertReaction = (reaction) => {
    switch (reaction) {
      case "like":
        return "👍";
      case "love":
        return "❤";
      case "haha":
        return "😆";
      case "wow":
        return "😮";
      case "sad":
        return "😢";
      case "angry":
        return "😠";
      default:
        return "";
    }
  };

  const handleReplyMessage = (messageId, messageContent, messageType) => {
    if (messageType === "image") messageContent = "Hình ảnh";
    else if (messageType === "video") messageContent = "Video";
    else if (messageType === "file") messageContent = "File";
    else messageContent = messageContent;
    setReplyMessage({ messageId, messageContent }); // Cập nhật state
  };

  // const [scrollToMessageId, setScrollToMessageId] = useState(null);
  // Effect để cuộn đến tin nhắn cụ thể khi scrollToMessageId thay đổi
  //  useEffect(
  const handleScrollToReply = (messageReply) => {
    if (messageReply && listGroupRef.current) {
      const targetMessageElement = listGroupRef.current.querySelector(
        `[message="${messageReply}"]`
      );
      if (targetMessageElement) {
        targetMessageElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        targetMessageElement.classList.remove("border-0");
        targetMessageElement.style.border = "2px solid var(--primary)";

        // Thiết lập thời gian để tắt viền
        setTimeout(() => {
          targetMessageElement.classList.add("border-0");
        }, 2000); // Sau 2 giây
      }
    }
  };
  // }, [scrollToMessageId]);
  return (
    <>
      <Container fluid className="message-list-container p-1 h-100">
        <Row className="m-0 position-relative h-100">
          <div className="position-absolute z-3">
            {/* Display the first pinned message */}
            {pinnedMessages.length > 0 && !showDropdown && (
              <PinnedMessageContainer className="pin-table ms-3 mt-2">
                <ul className="list-group">
                  <li
                    key={pinnedMessages[0].id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div
                      onClick={() =>
                        handleScrollToReply(pinnedMessages[0].content)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <p
                        className="mb-1"
                        style={{ fontSize: "0.9rem", color: "#555" }}
                      >
                        <strong>From:</strong> {pinnedMessages[0].senderName}
                      </p>
                      <p
                        className="mb-0"
                        style={{ fontSize: "0.9rem", fontWeight: "500" }}
                      >
                        {pinnedMessages[0].type === "image"
                          ? "🖼️ Image"
                          : pinnedMessages[0].type === "video"
                          ? "🎬 Video"
                          : pinnedMessages[0].type === "file"
                          ? "📎 File"
                          : pinnedMessages[0].content}
                      </p>
                    </div>
                    <div className="d-flex">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-2"
                        onClick={() => handleUnpin(pinnedMessages[0].id, id.id)}
                      >
                        Unpin
                      </Button>
                      {pinnedMessages.length > 1 && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          {pinnedMessages.length - 1}+
                        </Button>
                      )}
                    </div>
                  </li>
                </ul>
              </PinnedMessageContainer>
            )}
            {showDropdown && (
              <div className="pin-table">
                <ul className="list-group">
                  {pinnedMessages.map((message, index) => (
                    <li
                      key={message.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div
                        onClick={() =>
                          handleScrollToReply(pinnedMessages[0].content)
                        }
                      >
                        <p className="mb-1">
                          <strong>From:</strong> {message.senderName}
                        </p>
                        <p className="mb-0">
                          <strong>Message:</strong>{" "}
                          {message.type === "image"
                            ? "image"
                            : message.type === "video"
                            ? "video"
                            : message.type === "file"
                            ? "file"
                            : message.content}
                        </p>
                      </div>
                      <Button
                        className="btn btn-outline-danger"
                        onClick={() => handleUnpin(message.id, id.id)}
                      >
                        Unpin
                      </Button>
                      <Dropdown
                        drop="up"
                        className="position-absolute"
                        style={{ left: "90%", top: "15px" }}
                      >
                        <Dropdown.Toggle
                          variant="link"
                          id="dropdown-settings"
                          className="px-2"
                          onClick={() => setShowDropdown(false)}
                        ></Dropdown.Toggle>
                      </Dropdown>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Col className="p-0 h-100">
            <StyledListGroup
              ref={listGroupRef}
              className="message-container h-100"
            >
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <ListGroup.Item
                    key={index}
                    // message={message.id}
                    message={message.content}
                    className={`border-0 p-1 d-flex
                ${
                  message.sent.toString() ===
                  JSON.parse(localStorage.getItem("userId"))
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
                    style={{ backgroundColor: "unset" }}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Chat Item  */}
                    <div
                      className={`d-flex flex-row ${
                        message.sent.toString() ===
                        JSON.parse(localStorage.getItem("userId"))
                          ? "justify-content-end"
                          : "justify-content-start"
                      } mb-2`}
                    >
                      {message.sent.toString() !=
                        JSON.parse(localStorage.getItem("userId")) && (
                        <Image
                          src={message.avatarSender}
                          className="align-self-end mb-1 me-2"
                          style={{
                            width: "32px",
                            height: "32px",
                            border: "2px solid white",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                          roundedCircle
                        />
                      )}
                      <MessageBubble
                        className={`message-content position-relative ${
                          message.sent.toString() ===
                          JSON.parse(localStorage.getItem("userId"))
                            ? "sender"
                            : "receiver"
                        }`}
                      >
                        {message.sent.toString() !=
                          JSON.parse(localStorage.getItem("userId")) && (
                          <p
                            className="fst-italic m-0"
                            style={{ color: "rgb(24 95 71)" }}
                          >
                            {message.senderName}
                          </p>
                        )}
                        <div>
                          {message.hided ? (
                            <div className="text-muted">Tin nhắn đã bị ẩn</div>
                          ) : message.unsent ? (
                            <div className="text-muted">
                              Tin nhắn đã bị thu hồi
                            </div>
                          ) : (
                            // message.media && <Image src={message.media.url} style={{ width: '100px', height: '100px' }} />
                            <div>
                              {/* Component nhảy tới tin nhắn được reply  */}
                              {message.reply?.length > 0 && (
                                <Button
                                  variant="outline-secondary"
                                  onClick={() =>
                                    // setScrollToMessageId(message.reply)
                                    handleScrollToReply(message.reply)
                                  }
                                >
                                  {message.reply}
                                </Button>
                              )}

                              <div
                                style={{
                                  wordWrap: "break-word",
                                  whiteSpace: "pre-line",
                                }}
                              >
                                {message.isForwarded && (
                                  <div className="text-muted">Forwarded</div>
                                )}
                                {message.type === "image" && (
                                  <MediaContainer>
                                    <Image
                                      src={message.media.url}
                                      fluid
                                      style={{
                                        maxHeight: "250px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </MediaContainer>
                                )}
                                {message.type === "video" && (
                                  <MediaContainer>
                                    <video
                                      src={message.media.url}
                                      controls
                                      style={{
                                        maxHeight: "250px",
                                      }}
                                    />
                                  </MediaContainer>
                                )}
                                {message.type === "file" && (
                                  <MediaContainer>
                                    <a
                                      href={message.media.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ textDecoration: "none" }}
                                    >
                                      <embed
                                        src={message.media.url}
                                        style={{
                                          height: "150px",
                                        }}
                                      />
                                      <div className="file-name">
                                        {message.media.name}
                                      </div>
                                    </a>
                                  </MediaContainer>
                                )}

                                {message.content.length > 60
                                  ? message.content.length > 30
                                    ? message.content
                                        .substring(0, 60)
                                        .match(/.{1,30}/g)
                                        .join("\n") + "..."
                                    : message.content
                                  : message.content}
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          className={`d-flex justify-content-between align-items-center mt-1 ${
                            message.sent.toString() ===
                            JSON.parse(localStorage.getItem("userId"))
                              ? ""
                              : "flex-row-reverse"
                          }`}
                        >
                          <div className="d-flex align-items-center">
                            {!message.hided &&
                              !message.unsent &&
                              message.reactions &&
                              message.reactions.map((reaction, index) => {
                                if (index > 1) {
                                  return null;
                                }
                                return (
                                  <span
                                    key={index}
                                    className={`d-flex align-items-center ${
                                      !message.sent.toString() ===
                                        JSON.parse(
                                          localStorage.getItem("userId")
                                        ) &&
                                      index < 1 &&
                                      "ms-2"
                                    }`}
                                    style={{ width: "20px", height: "20px" }}
                                  >
                                    {convertReaction(reaction.reaction)}
                                  </span>
                                );
                              })}
                            <small
                              className={`${
                                message.sent.toString() ===
                                  JSON.parse(localStorage.getItem("userId")) &&
                                "me-2"
                              } ms-1`}
                            >
                              {!message.hided &&
                                !message.unsent &&
                                message.reactions?.length > 0 &&
                                message.reactions?.length}
                            </small>
                          </div>
                          <small className="text-muted">
                            {!message.hided && !message.unsent && message.time}
                          </small>
                        </div>
                        {showDropdownIndex === index &&
                          !message.unsent &&
                          !message.hided && (
                            <MessageActionBar
                              className={
                                message.sent.toString() ===
                                JSON.parse(localStorage.getItem("userId"))
                                  ? "sender"
                                  : "receiver"
                              }
                              style={{
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            >
                              {/* Reply Button */}
                              <div
                                className="action-button"
                                onClick={() =>
                                  handleReplyMessage(
                                    message.id,
                                    message.content,
                                    message.type
                                  )
                                }
                              >
                                <FontAwesomeIcon icon={faReply} />
                              </div>

                              {/* Reaction Button */}
                              <Dropdown drop="up" className="d-inline">
                                <Dropdown.Toggle
                                  as="div"
                                  className="action-button"
                                  id="reaction-dropdown"
                                >
                                  <FontAwesomeIcon icon={faThumbsUp} />
                                </Dropdown.Toggle>

                                <ReactionMenu>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleReaction("love", message.id)
                                    }
                                  >
                                    <span>❤️</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleReaction("haha", message.id)
                                    }
                                  >
                                    <span>😆</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleReaction("wow", message.id)
                                    }
                                  >
                                    <span>😮</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleReaction("sad", message.id)
                                    }
                                  >
                                    <span>😢</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleReaction("angry", message.id)
                                    }
                                  >
                                    <span>😠</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleReaction("like", message.id)
                                    }
                                  >
                                    <span>👍</span>
                                  </Dropdown.Item>
                                </ReactionMenu>
                              </Dropdown>

                              {/* Options Button */}
                              <Dropdown className="d-inline">
                                <Dropdown.Toggle
                                  as="div"
                                  className="action-button"
                                  id="options-dropdown"
                                >
                                  <i className="fas fa-ellipsis-v"></i>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="shadow-sm border-0">
                                  {message.sent.toString() ===
                                    JSON.parse(
                                      localStorage.getItem("userId")
                                    ) && (
                                    <Dropdown.Item
                                      onClick={() => handleUnsend(message.id)}
                                    >
                                      <span>Thu Hồi</span>
                                    </Dropdown.Item>
                                  )}
                                  <Dropdown.Item
                                    onClick={() =>
                                      handlePinMessage(message.id, id.id)
                                    }
                                  >
                                    <span>Ghim</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => handleDelete(message.id)}
                                  >
                                    <span>Xóa</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => handleHide(message.id)}
                                  >
                                    <span>Ẩn</span>
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => handleForward(message.id)}
                                  >
                                    <span>Chuyển lại</span>
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </MessageActionBar>
                          )}
                      </MessageBubble>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <div className="text-center">No messages</div>
              )}

              <div className="px-1 d-flex flex-row-reverse align-items-center mt-1 mb-2">
                <div
                  className="d-flex align-items-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.8)",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <small
                    className="text-muted me-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    Đã xem
                  </small>
                  <Image
                    src={
                      currentUserAvatar ||
                      "https://res.cloudinary.com/dfvuavous/image/upload/v1744729521/mh7yvzr5xtsta96uyh1q.jpg"
                    }
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "1px solid white",
                    }}
                    alt="Đã xem"
                    title="Bạn đã xem"
                  />
                </div>
              </div>
            </StyledListGroup>
          </Col>
        </Row>
      </Container>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            {/* <Thumb>
    <ImageSidebarStyled2 src="https://i.imgur.com/rsJjBcH.png" rounded></ImageSidebarStyled2>
    <Icon src={icons.camera} rounded></Icon>
    </Thumb> */}
            <Row className="justify-content-center align-items-center h-100 w-100 d-flex">
              <Col lg="6" className="mb-4 mb-lg-0 w-100">
                <Card className="mb-3" style={{ borderRadius: ".5rem" }}>
                  {userInfo.map((user, index) => (
                    <Row className="g-0 p-2" key={index}>
                      <Col
                        lg="2"
                        className="d-flex justify-content-center align-items-center"
                      >
                        <Image
                          src={user.photoURL}
                          style={{ width: "50px", height: "50px" }}
                          roundedCircle
                        />
                      </Col>
                      <Col lg="8">
                        <Card.Body>
                          <Card.Text>{user.name}</Card.Text>
                        </Card.Body>
                      </Col>
                      <Col
                        lg="2"
                        className="d-flex justify-content-center align-items-center"
                      >
                        <Button
                          variant="primary"
                          disabled={forwarded.includes(index)}
                          onClick={() =>
                            handleSendForward(index, user.idChatRoom)
                          }
                        >
                          {forwarded.includes(index) ? "sent" : "send"}
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </Card>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MessageList;
