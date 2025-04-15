import React, {useState, useEffect, createContext} from "react";
import { Col, ListGroup } from 'react-bootstrap';
import styled from "styled-components";
import Tab from 'react-bootstrap/Tab';
import Stack from 'react-bootstrap/Stack';
import axiosClient from '../api/axiosClient';

import SideBar from "../components/chat/SideBar";
import SearchBar from '../components/chat/SearchBar';
import ChatItem from "../components/chat/ChatItem";
import Header from "../components/chat/Main-Header";
import MessageList from "../components/chat/Main-MessageList";
import InputArea from "../components/chat/Main-InputArea";
import ConfirmDialog from "../components/chat/DialogMeeting";
import {useParams} from 'react-router-dom';
import io from 'socket.io-client';
const ENDPOINT = process.env.REACT_APP_API_URL;
let socket;

const ChatMenu = () => (
    <ChatColStyled>
      <SideBar />
    </ChatColStyled>
  );
const ChatList = (id) => (
<ChatColStyled>
    <SearchBar />
    <ChatItemGroup id={id.id}/>
</ChatColStyled>
);

const MessageArea = ({ id }) => (
  <div className="flex-grow-1 border d-flex flex-column-reverse" style={{ backgroundColor: "#F1FFFA" }}>
    <MessageList id={id} socket={socket}/>
  </div>
);

const ChatItemGroup = (id) => {
  const [chatItems, setChatItems] = useState([]);
  const [id2, setId] = useState();
  useEffect(() => {
    axiosClient.get('/info-chat-item').then((res) => {
      const data = res.data.data;
      const chatItems = data.map((item, index) => (
        <ChatItem key={index} data={item} socket={socket} />
      ));
      setChatItems(chatItems);
    });
    socket.on('message', (message) => {
      setId(message);
    });
  }, [id, id2]);

  return <StyledListGroup>{chatItems}</StyledListGroup>;
};
const ChatPane = ({ id}) => {
  return (
    <Tab.Pane eventKey={id} className="h-100">
        <Stack className="h-100">
            <Header id={id} socket={socket}/>
            <MessageArea id={id}/>
            <InputArea id={id} socket={socket}/>
        </Stack>
    </Tab.Pane>
  );
};
const Chat = () => {
  const {id} = useParams();
  socket = io(ENDPOINT);
  socket.on('connected', () => {
    console.log('connected');
  });
    socket.emit('setup', localStorage.getItem('userId'));
    socket.on('setup', (user) => {
      console.log('setup', user);
    });
  if(id){
    socket.emit('join chat', id, localStorage.getItem('userId'));
    socket.on('joined chat', (room) => {
      console.log('joined chat', room);
    });
  }
  const [showMeeting, setShowMeeting] = useState(false);
  const [data, setData] = useState({}); // New state variable
  const [user, setUser] = useState({});

  const handleClose = () => {
    socket.emit("decline", { meetingId: data.meetingId, userId: user._id});
    setShowMeeting(false);
  };
  const handleConfirm = () => {
    // console.log(data);
    socket.emit('accept meeting', { meetingId: data.meetingId, userId: user._id});
    window.open('/meeting2/' + data.meetingId, '_blank');
    setShowMeeting(false);
  };
  useEffect(() => {
    if (!id) return;
    axiosClient.get("/info-user/" + id).then((res) => {
        const data = res.data.data;
        // console.log("data", data);
        setUser(data);
    });
}, [id]);
  useEffect(() => {
    const handleNotify = (data) => {
      setData(data);
      setShowMeeting(true);
    };

    socket.on("notify", handleNotify);

    // Clean up the effect
    return () => socket.off("notify", handleNotify);

  }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount
    return (
        <Tab.Container id="list-group-tabs-example" defaultActiveKey={id}>
            <Container className="w-100 m-0">
                <FirstColumn>
                    <ThirdColumn>
                        <ChatMenu />
                    </ThirdColumn>
                    <FourthColumn>
                        <ChatList id={id}/>
                    </FourthColumn>
                </FirstColumn>

                <SecondColumn>
                    <Tab.Content className="h-100">
                      {id? <ChatPane eventKey={id} id={id}/> : <div>We are meme</div>}
                    </Tab.Content>
                </SecondColumn>
            </Container>
            <ConfirmDialog show={showMeeting} handleClose={handleClose} handleConfirm={handleConfirm} />
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
  scrollbar-color: #DEDEDE transparent;
  scroll-behavior: smooth;
`;
export default Chat;
