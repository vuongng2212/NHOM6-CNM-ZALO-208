import React, { useState, useEffect, useContext, useRef } from "react";
import { Image, Container, Row, Col, Card, Form } from "react-bootstrap";
import {
  ChatDotsFill,
  PersonVcard,
  PersonPlusFill,
  PersonDash,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
// import { icons } from "../../assets";
import axiosClient from "../../api/axiosClient";
import { AuthToken } from "../../authToken/index";
import route from "../../configs/route";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const SideBarStyled = styled.div`
  height: 100vh;
  background-color: var(--primary);
`;

const ItemSidebarStyled = styled.div`
  height: calc(100% / 9);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageSidebarStyled = styled(Image)`
  width: 50px;
  height: 50px;
`;
const SideBar = () => {
  // console.log(123);
  const fileInputRef = useRef();
  const [avatar, setAvatar] = useState(""); // Add this line
  const [show, setShow] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [userInfoUpdate, setUserInfoUpdate] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const { logout } = useContext(AuthToken);
  const [showModal, setShowModal] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const navigate = useNavigate();
  const handleClose = () => {
    setShow(false);
    setIsEditing(false);
  };
  const handleShow = () => {
    setShow(true);
  };
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosClient.get("/profile");
        // console.log(res.data);
        setUserInfo(res.data.data);
        setUserInfoUpdate(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserInfo();
  }, []);
  const handleUpdateClick = async () => {
    setIsEditing(true);
  };
  const handleCancleClick = () => {
    setIsEditing(false);
    setAvatar("");
    setFile(null);
    setUserInfoUpdate(userInfo);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "dob") {
      updatedValue = value.split("-").reverse().join("-");
    }

    setUserInfoUpdate((prevState) => ({
      ...prevState,
      [name]: updatedValue,
    }));
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      const file = event.target.files[0];
      const reader = new FileReader();
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (allowedTypes.includes(file.type)) {
        reader.onload = (e) => {
          setAvatar(e.target.result);
        };

        reader.readAsDataURL(file);
        setIsEditing(true);
      } else {
        alert("Only PNG, JPEG, and JPG images are allowed.");
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if new password and confirm new password match
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      alert("Mật khẩu mới và nhập lại mật khẩu phải giống nhau");
      return;
    }
    if (passwords.newPassword == passwords.currentPassword) {
      alert("Mật khẩu cũ và mật khẩu mới không được trùng");
      return;
    }
    const data = {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/change-password`,
        data,
        {
          headers: {
            Authorization: Cookies.get("authToken"),
          },
        }
      );
      alert("Thay đổi mật khẩu thành công");
      console.log("Password changed successfully:", response.data);
      // Handle success, e.g., show success message to the user
    } catch (error) {
      if (
        error.response.status === 400 &&
        error.response.data.message === "Mật khẩu hiện tại không chính xác"
      ) {
        alert("Mật khẩu hiện tại không chính xác");
      } else {
        alert(
          "An error occurred while changing the password. Please try again later."
        );
      }
      console.error("Error changing password:", error);
    }
  };

  const handleDoneClick = async () => {
    if (
      !file &&
      userInfoUpdate.name === userInfo.name &&
      userInfoUpdate.phone === userInfo.phone &&
      userInfoUpdate.dob === userInfo.dob
    ) {
      alert("Nothing to update");
      setIsEditing(false);
      setAvatar("");
      setFile(null);
      setUserInfoUpdate(userInfo);
      return;
    }
    if (avatar) {
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        console.log(process.env.REACT_APP_API_URL + "/api" + "/profile/avatar");
        const response = await axios.post(
          process.env.REACT_APP_API_URL + "/api" + "/profile/avatar",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: Cookies.get("authToken"),
            },
          }
        );
        if (response.status === 200) {
          alert("Image uploaded successfully");
          console.log("Image uploaded successfully");
          console.log("Updated UserInfo:", userInfo);
          setIsEditing(false);
          setFile(null);
        } else {
          console.log("Failed to upload image");
          setIsEditing(false);
          setAvatar("");
          setFile(null);
          setUserInfoUpdate(userInfo);
        }
      } catch (error) {
        console.log("Error uploading image:", error);
        setIsEditing(false);
        setAvatar("");
        setFile(null);
        setUserInfoUpdate(userInfo);
      }
    }
    if (
      userInfoUpdate.name !== userInfo.name ||
      userInfoUpdate.phone !== userInfo.phone ||
      userInfoUpdate.dob !== userInfo.dob
    ) {
      console.log("Updating profile: ", userInfoUpdate);
      const response = await axiosClient.post("/profile", userInfoUpdate);

      if (response.status === 200) {
        alert("Profile updated successfully");
        console.log("Updated UserInfo:", userInfo);
        setIsEditing(false);
        setFile(null);
        const res = await axiosClient.get("/profile");
        // console.log(res.data);
        setUserInfo(res.data.data);
        setUserInfoUpdate(res.data.data);
      } else {
        console.log("Failed to update profile");
        setIsEditing(false);
        setAvatar("");
        setFile(null);
        setUserInfoUpdate(userInfo);
      }
    }
  };
  const handleChangePass = (e) => {
    const { name, value } = e.target;
    setPasswords((prevPasswords) => ({
      ...prevPasswords,
      [name]: value,
    }));
  };
  const handleLogoutClick = () => {
    const confirm = window.confirm("Bạn muốn đăng xuất phải không?");
    if (confirm) {
      logout();
      navigate(route.home);
    }
  };
  const triggerFileSelectPopup = () => fileInputRef.current.click();

  return (
    <>
      <SideBarStyled>
        <ItemSidebarStyled style={{ cursor: "pointer" }} onClick={handleShow}>
          <ImageSidebarStyled
            src={
              userInfo.avatar
                ? userInfo.avatar
                : "https://res.cloudinary.com/dfvuavous/image/upload/v1744729521/mh7yvzr5xtsta96uyh1q.jpg"
            }
            roundedCircle
          />
        </ItemSidebarStyled>

        <ItemSidebarStyled>
          <Link to={route.chat}>
            <ChatDotsFill size={35} color="white" />
          </Link>
        </ItemSidebarStyled>

        <ItemSidebarStyled>
          <Link to={route.friend}>
            <PersonVcard size={35} color="white" />
          </Link>
        </ItemSidebarStyled>

        <ItemSidebarStyled>
          <Link to={route.friendRequest}>
            <PersonPlusFill size={35} color="white" />
          </Link>
        </ItemSidebarStyled>

        <ItemSidebarStyled>
          <Link to={route.RecallFriendRequest}>
            <PersonDash size={35} color="white" />
          </Link>
        </ItemSidebarStyled>
      </SideBarStyled>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="justify-content-center align-items-center w-100">
              <Col md="12">
                <Card className="border-0">
                  <Row className="g-0">
                    <Col md="12" className="text-center mb-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                      <Image
                        src={
                          avatar
                            ? avatar
                            : userInfo.avatar
                            ? userInfo.avatar
                            : "https://i.imgur.com/rsJjBcH.png"
                        }
                        alt="Avatar"
                        className="mb-3"
                        style={{
                          width: "100px",
                          height: "100px",
                          cursor: "pointer",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        onClick={triggerFileSelectPopup}
                      />

                      <div className="d-flex flex-column align-items-center">
                        {isEditing ? (
                          <Form.Control
                            type="text"
                            maxLength={15}
                            value={userInfoUpdate.name}
                            name="name"
                            onChange={handleChange}
                            className="mb-2 text-center"
                            style={{ maxWidth: "200px" }}
                          />
                        ) : (
                          <h5 className="fw-bold mb-2">
                            {userInfoUpdate.name}
                          </h5>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="d-flex justify-content-center mt-3 mb-3">
                          <Button
                            variant="primary"
                            className="me-2"
                            onClick={handleDoneClick}
                            style={{ borderRadius: "20px", width: "100px" }}
                          >
                            Done
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={handleCancleClick}
                            style={{ borderRadius: "20px", width: "100px" }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={handleUpdateClick}
                          className="mb-3"
                          style={{ borderRadius: "20px", width: "100px" }}
                        >
                          Update
                        </Button>
                      )}
                    </Col>
                  </Row>

                  <div style={{ marginBottom: "20px" }}>
                    <h6 className="fw-bold ps-2 border-bottom pb-2">
                      Information
                    </h6>

                    <div className="mt-3 ps-2">
                      <h6 className="mb-1 text-muted">Email</h6>
                      <p>{userInfo.email}</p>
                    </div>

                    <div className="mt-3 ps-2">
                      <h6 className="mb-1 text-muted">Phone</h6>
                      {isEditing ? (
                        <Form.Control
                          type="text"
                          value={userInfoUpdate.phone}
                          name="phone"
                          onChange={handleChange}
                          style={{ maxWidth: "200px" }}
                        />
                      ) : (
                        <p>{userInfoUpdate.phone}</p>
                      )}
                    </div>

                    <div className="d-flex ps-2">
                      <div className="me-4 flex-grow-1">
                        <h6 className="mb-1 text-muted">Dob</h6>
                        {isEditing ? (
                          <Form.Control
                            type="date"
                            value={userInfoUpdate.dob
                              .split("-")
                              .reverse()
                              .join("-")}
                            name="dob"
                            onChange={handleChange}
                          />
                        ) : (
                          <p>{userInfoUpdate.dob}</p>
                        )}
                      </div>

                      <div>
                        <h6 className="mb-1 text-muted">Gender</h6>
                        <p>{userInfo.gender}</p>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex mt-3 justify-content-center">
                    {!isEditing && (
                      <>
                        <Button
                          variant="danger"
                          className="me-2"
                          onClick={handleShowModal}
                          style={{ borderRadius: "20px" }}
                        >
                          Change Password
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={handleLogoutClick}
                          style={{ borderRadius: "20px" }}
                        >
                          Logout
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
      {/* Modal Change Password                 */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <br />

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formcurrentPassword">
              <Form.Label>Current Password:</Form.Label>
              <br />
              <br />
              <Form.Control
                type="password"
                placeholder="Enter your current Password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChangePass}
              />
            </Form.Group>
            <br />

            <Form.Group controlId="formNewPassword">
              <Form.Label>New Password:</Form.Label>
              <br />
              <br />
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                name="newPassword"
                value={passwords.newPassword}
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                required
                onChange={handleChangePass}
              />
            </Form.Group>
            <br />

            <Form.Group controlId="formConfirmNewPassword">
              <Form.Label>Confirm New Password:</Form.Label>
              <br />
              <br />

              <Form.Control
                type="password"
                placeholder="Confirm your new password"
                name="confirmNewPassword"
                value={passwords.confirmNewPassword}
                onChange={handleChangePass}
                required
              />
            </Form.Group>
            <br />
            <br />
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SideBar;
