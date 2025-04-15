import Stack from "react-bootstrap/Stack";
import {
  Image,
  Container,
  Row,
  Col,
  Card,
  Form,
  FormControl,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { icons } from "../../assets";
import Cookies from "js-cookie";
import axiosClient from "../../api/axiosClient";
import styled from "styled-components";
import { useState, useRef, useEffect } from "react";
import FriendItem from "./FriendItem";
import axios from "axios";

const SearchBar = () => {
  const [show, setShow] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [previewAvatarGroup, setPreviewAvatarGroup] = useState();
  const [checkedUserId, setCheckedUserId] = useState([]);
  const [groupName, setGroupName] = useState("");

  const [userInfo, setUserInfo] = useState({}); // eslint-disable-line no-unused-vars
  const [sent, setSent] = useState(false); // eslint-disable-line no-unused-vars
  const [isFriend, setIsFriend] = useState(false); // eslint-disable-line no-unused-vars
  const fileInputRef = useRef();
  const handleClose = () => {
    setShow(false);
  };

  const handleSearch = async (event) => {
    const searchTerm = event.target.value;
    if (searchTerm.length === 10) {
      try {
        const res = await axiosClient.post("/search-user", { searchTerm });
        if (res.status === 200) {
          const userData = res.data.data;
          setUserInfo(userData);
          if (userData.isFriend) setIsFriend(true);
          else if (userData.sent) setSent(true);
          else {
            setIsFriend(false);
            setSent(false);
          }
          setShow(true);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  const handleAddFriend = async () => {
    const res = await axiosClient.post("/add-friend", { userInfo });
    if (res.status === 200) {
      console.log("Add friend success");
      // console.log(res);
      setSent(true);
    }
  };

  const handleAddGroupModal = () => {
    setShowGroup(true);
  };

  const handleCloseGroupModal = () => setShowGroup(false);

  const triggerFileSelectPopup = () => fileInputRef.current.click();

  const handleAvatarChange = (event) => {
    // console.log(event.target.files);

    if (event.target.files && event.target.files.length > 0) {
      const newFile = event.target.files[0];
      setPreviewAvatarGroup(newFile); // Set the selected file to state
    }
  };

  const handleChangeGroupName = (event) => {
    setGroupName(event.target.value);
  };

  const handleSubmitGroup = async (event) => {
    event.preventDefault();
    const data= new FormData();
    // console.log(checkedUserId);
    data.append("members", JSON.stringify(checkedUserId))
    // checkedUserId.map((id) => {
    //   data.append("members",id);
    // });

      data.append("name",groupName);
      //data.append("members",memberDatas);
      data.append("photo",previewAvatarGroup);
    // const data = {
    //   name: groupName,
    //   members: memberDatas,
    //   photo:previewAvatarGroup
    // };
  //  console.log(data);
  //  console.log(previewAvatarGroup);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/creategroup`,
        data, // Send the FormData object instead of the data object
        {
          headers: {
           'Content-Type': 'multipart/form-data',
              'Authorization':  Cookies.get('authToken'),
          },
        }
      );

      console.log("Group created successfully:", response.data);
      setCheckedUserId([])
      setShowGroup(false); // Assuming setState function for showing group modal/dialog
      window.location.reload();
    } catch (error) {
      alert(error.response.data.error);
      setCheckedUserId([])
      setShowGroup(false); // Assuming setState function for showing group modal/dialog
    }
  };

  const handleFriendItemCheck = (_id, isChecked) => {
    setCheckedUserId((prevUserIds) => {
      if (isChecked) {
        return [...prevUserIds, _id];
      } else {
        return prevUserIds.filter((id) => id !== _id);
      }
    });
  };


  // const dataFriendFake = [
  //   {
  //     userId: 1,
  //     userName: "Tú Uyên",
  //     avatar: "https://i.imgur.com/rsJjBcH.png",
  //   },
  //   {
  //     userId: 2,
  //     userName: "Tú Uyên",
  //     avatar: "https://i.imgur.com/rsJjBcH.png",
  //   },
  //   {
  //     userId: 3,
  //     userName: "Tú Uyên",
  //     avatar: "https://i.imgur.com/rsJjBcH.png",
  //   },
  // ];
  const handleFetchFriends = async () => {
    try {
      const response = await axiosClient.get("/getAllFriend"
      );
      if (response.status === 200) {
        // Check if response.data is an array before setting state
        if (Array.isArray(response.data)) {
          setIsFriend(response.data);
        } else {
          console.error("Error: Response data is not an array");
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    handleFetchFriends();
  }, []);
  return (
    <>
      <Stack direction="horizontal" gap={1} className="p-3">
        <div>
          <Image src={icons.search} style={{ width: "25px", height: "25px" }} />
        </div>
        <Form.Control
          className="flex-grow-1 border-0"
          placeholder="Search..."
          onChange={handleSearch}
        />
        <div className="p-1">
          <Image
            src={icons.addFriend}
            style={{ width: "22px", height: "22px" }}
          />
        </div>
        <div className="p-1" onClick={handleAddGroupModal}>
          <Image
            src={icons.addGroup}
            style={{ width: "25px", height: "25px" }}
          />
        </div>
      </Stack>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container fluid>
            <Row className="justify-content-center align-items-center h-100 w-100 d-flex">
              <Col lg="6" className="mb-4 mb-lg-0 w-100">
                <Card className="mb-3" style={{ borderRadius: ".5rem" }}>
                  <Row className="g-0">
                    <Col
                      md="4"
                      className="gradient-custom text-center px-0"
                      style={{
                        borderTopLeftRadius: ".5rem",
                        borderBottomLeftRadius: ".5rem",
                      }}
                    >
                      <Image
                        src={userInfo.avatar}
                        alt="Avatar"
                        className="my-4"
                        style={{ width: "80px", cursor: "pointer" }}
                        fluid
                      />
                      <div className="d-flex flex-column justify-content-between  align-items-center">
                        <h5>{userInfo.name}</h5>
                        <Button
                          style={{
                            backgroundColor: "",
                            transition: "all 0.3s ease",
                            ":hover": {
                              backgroundColor: "#9E9E9E",
                              opacity: "1",
                            },
                          }}
                          className="d-flex justify-content-evenly w-75 align-items-center m-2"
                          onClick={!isFriend || !sent ? handleAddFriend : null}
                          disabled={isFriend || sent}
                        >
                          <span className="text-white">
                            {isFriend ? "Friend" : sent ? "Sent" : "Add friend"}
                          </span>
                        </Button>
                      </div>
                    </Col>
                    <Col md="8">
                      <Card.Body className="p-4">
                        <h6>Information</h6>
                        <hr className="mt-0 mb-4" />
                        <Row className="pt-1">
                          <Col sm="12" className="mb-3">
                            <h6>Email</h6>
                            <p className="text-muted">{userInfo.email}</p>
                          </Col>
                          <Col sm="6" className="mb-3">
                            <h6>Phone</h6>
                            <p className="text-muted">{userInfo.phone}</p>
                          </Col>
                        </Row>

                        <hr className="mt-0 mb-4" />
                        <Row className="pt-1">
                          <Col sm="8" className="mb-3">
                            <h6>Dob</h6>
                            <p className="text-muted">{userInfo.dob}</p>
                          </Col>
                          <Col sm="4" className="mb-3">
                            <h6>Gender</h6>
                            <p className="text-muted">{userInfo.gender}</p>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-start">
                          <a href="#!">
                            <i className="fab fa-facebook me-3"></i>
                          </a>
                          <a href="#!">
                            <i className="fab fa-twitter me-3"></i>
                          </a>
                          <a href="#!">
                            <i className="fab fa-instagram me-3"></i>
                          </a>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
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
      {/*  Model add group */}
      <Modal show={showGroup} onHide={handleCloseGroupModal}>
        <Form onSubmit={handleSubmitGroup} encType="multipart/form-data">
          <Modal.Header closeButton>
            <Modal.Title>Tạo nhóm mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
              <Row className="justify-content-center align-items-center h-100 w-100 d-flex mb-3">
                <Col lg="2" className="mb-4 mb-lg-0">
                  <Image
                    className="mx-2"
                    // src={icons.image}
                    src={
                      (previewAvatarGroup &&
                        URL.createObjectURL(previewAvatarGroup)) ||
                      icons.image
                    }
                    style={{ width: "40px", height: "40px" }}
                    onClick={triggerFileSelectPopup}
                  />

                  <input
                    type="file"
                    name="media"
                    id="media"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                </Col>
                <Col lg="10">
                  <Form.Control
                    className="flex-grow-1 border-0 fw-bold "
                    name="groupName"
                    onChange={handleChangeGroupName}
                    placeholder="Nhập tên nhóm"
                    style={{ fontSize: "17px" }}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <FormControl
                  type="text"
                  placeholder="Nhập số điện thoại thành viên"
                  onChange={handleSearch}
                />
              </Row>
              <Row>
                <Col lg="12">
                  <StyledListGroup>
                    {/* Mapping through isFriend array if it's an array */}
                    {Array.isArray(isFriend) &&
                      isFriend.map((friend, index) => {
                        // console.log(friend);
                        return (
                          <FriendItem
                            friend={friend}
                            key={friend._id}
                            onCheck={(userId, isChecked) =>
                              handleFriendItemCheck(userId, isChecked)
                            }
                          />
                        );
                      })}
                  </StyledListGroup>
                </Col>
                {/* Tạm tắt feature này để update sau  */}
                {/* <Col lg='4'>
                  Đây sẽ chứa các user đã được chọn để tạo nhóm
                  <StyledListGroup>
                    <StyledListGroupItem
                        className="d-flex justify-content-between align-items-start border-0 px-2 py-3"
                          action
                          onClick={console.log(123)}
                        >
                          a</StyledListGroupItem>
                  </StyledListGroup>
                </Col> */}
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSubmitGroup} variant="primary" type="submit">
              Tạo nhóm
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};
const StyledListGroup = styled(ListGroup)`
  max-height: 60vh;
  overflow-y: auto;
  border-radius: 0;
  scrollbar-width: thin;
  scrollbar-track-color: transparent;
  scrollbar-color: #dedede transparent;
  scroll-behavior: smooth;
`;

export default SearchBar;
