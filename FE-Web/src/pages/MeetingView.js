import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import {useParams} from 'react-router-dom';
import { Row, Col, Button } from "react-bootstrap";
import io from 'socket.io-client';
const ENDPOINT = process.env.REACT_APP_API_URL;
let socket;
function SenderView({ webcamStream, micRef, webcamOn, isLocal }) {
  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  return (
    (!isLocal) ?
    <div style={{ position: "", width: "80%", height: "60%", margin: "20px" }}>
      <Row>
        <Col>
          <div style={{ flex:1, position: "", width: "100%", height: "auto", bottom: "10px", right: "10px",  borderRadius: "20px", overflow: "hidden" }}>
          <audio ref={micRef} autoPlay playsInline muted={isLocal} />
            <ReactPlayer
              playsinline // very very imp prop
              pip={false}
              light={false}
              controls={false}
              muted={true}
              playing={true}
              url={videoStream}
              height={"auto"}
              width={"100%"}
              onError={(err) => {
                console.log(err, "participant video error");
              }}
            />
          </div>
        </Col>
      </Row>
    </div>
    :
    <Row>
      <Col>
        <div style={{ flex:0, position: "fixed", width: "300px", height: "auto", bottom: "10px", right: "10px", zIndex: '999',  borderRadius: "20px", overflow: "hidden"  }}>
          <ReactPlayer
            playsinline // very very imp prop
            pip={false}
            light={false}
            controls={false}
            muted={true}
            playing={true}
            url={videoStream}
            height={"auto"}
            width={"100%"}
            onError={(err) => {
              console.log(err, "participant video error");
            }}
          />
        </div>
      </Col>
    </Row>

  );
  }

  function ReceiverView({ micStream, micOn, isLocal, displayName }) {
  const micRef = useRef(null);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div style={{ }}>
      <Row>
        <Col>
          <div >
            <p>{displayName}</p>
            <audio ref={micRef} autoPlay playsInline muted={isLocal} />
          </div>
        </Col>
      </Row>
    </div>
  );
  }

  function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);
  return (
    <>
      {/* {!isLocal && (
        <div style={{position: "fixed", width: "300px", height: "auto",  bottom: '10px', right: "10px"}}>
        <ReceiverView
          micStream={micStream}
          micOn={micOn}
          isLocal={isLocal}
          displayName={displayName}
        /></div>
      )} */}
      {webcamOn && (
        <SenderView webcamStream={webcamStream} micRef={micRef} webcamOn={webcamOn} isLocal={isLocal} />

      )}</>
  );
  }


function Controls() {
  const { leave, toggleMic, toggleWebcam, startHls, stopHls } = useMeeting();
  return (
    <div className="d-flex flex-row justify-content-lg-evenly align-content-between w-50 ">
      <Button onClick={() => {
        const confirm = window.confirm("Are you sure you want to leave the meeting?");
        if (confirm) {
          window.close();
          leave();
        }
        }}>Leave</Button>
      {/* &emsp;|&emsp; */}
      <Button onClick={() => toggleMic() }>Toggle Mic</Button>
      <Button onClick={() => toggleWebcam()}>Toggle Camera</Button>

      <Button
        onClick={() => {
          //Start the HLS in SPOTLIGHT mode and PIN as
          //priority so only speakers are visible in the HLS stream
          startHls({
            layout: {
              type: "SPOTLIGHT",
              priority: "PIN",
              gridSize: "20",
            },
            theme: "LIGHT",
            mode: "video-and-audio",
            quality: "high",
            orientation: "landscape",
          });
        }}
      >
        Start HLS
      </Button>
      <Button onClick={() => stopHls()}>Stop HLS</Button>
    </div>
  );
}
function Container(props) {
  const [joined, setJoined] = useState("JOINING");
  var socket = props.socket;
  const { join, participants, toggleWebcam } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    onMeetingLeft: () => {
      props.onMeetingLeave();
      setJoined(null);
    },
  });

  socket.on("accept meeting", (data) => {
    setJoined("JOINING");
    join();
  });
  socket.on("decline", (data) => {
    window.confirm("The user declined the meeting");
    window.close();
  });
  return (
    <div style={{backgroundColor: '#1e2329', padding: ''}}>
      {/* <h3>Meeting Id: {props.meetingId}</h3> */}
      {joined && joined === "JOINED" ? (
        <div className="d-flex flex-column justify-content-between align-items-center p-3 w-100 h-100">
          <Controls leave={() => {setJoined(null);} } />
          {[...participants.keys()].map((participantId) => (
              <ParticipantView
                participantId={participantId}
                key={participantId}
              />
          ))}
        </div>
      ) : joined && joined === "JOINING" && (
        <div className="d-flex justify-content-center align-items-center vw-100 vh-100 bg-light">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Waiting for you...</span>
      </div>
      <p className="m-2">Waiting for du...</p>
    </div>
      )
    }
    </div>
  );
}

const MeetingView =  ()=> {
  const {meetingId} = useParams();
  socket = io(ENDPOINT);
  socket.on('connected', () => {
    console.log('connected');
  });
  socket.emit('setup', localStorage.getItem('userId'));
  socket.on('setup', (user) => {
    console.log('setup', user);
  });
  // socket.emit('join chat', id, localStorage.getItem('userId'));
  // socket.on('joined chat', (room) => {
  //   console.log('joined chat', room);
  // });
  const authToken = process.env.REACT_APP_VIDEO_SDK_AUTH_TOKEN;
  console.log("asd", meetingId, authToken);
  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: false,
        name: "C.V. Raman",
      }}
      token={authToken}
    >
      <MeetingConsumer>
        {() => <Container meetingId={meetingId} socket={socket} />}
      </MeetingConsumer>
    </MeetingProvider>
  ) : (
    <div>Invalid meeting id or auth token</div>
  );
}

export default MeetingView;
