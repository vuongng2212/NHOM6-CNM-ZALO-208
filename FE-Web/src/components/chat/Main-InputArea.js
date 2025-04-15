import React, { useState, useRef, useEffect } from "react";
import { Image, Form, Card, Col, Row, Badge, Button, CloseButton } from 'react-bootstrap';
import Stack from 'react-bootstrap/Stack';
import { icons } from '../../assets';
import axiosClient from '../../api/axiosClient';
import axios from 'axios';
import Cookies from 'js-cookie'; // import js-cookie
import InputEmoji from "react-input-emoji"; // Import InputEmoji
import { useGlobalState } from '../../util/state';

const InputArea = (chatRoomId) => {
    var socket = chatRoomId.socket;
    const fileInputRef = useRef();
    const [previews, setPreviews] = useState([]); // Change to array for multiple previews
    const [files, setFiles] = useState([]); // Change to array for multiple files
    const [message, setMessage] = useState(''); // Add this line
    const [showReplyMessage, setShowReplyMessage] = useState(false);
    const [replyMessage, setReplyMessage] = useGlobalState('replyMessage');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Chỉ kích hoạt setShowReplyMessage(true) khi replyMessage không rỗng
        if (replyMessage !== '') {
            setShowReplyMessage(true);
        }
      }, [replyMessage]); // Sử dụng sessionData trong dependency array để đảm bảo useEffect được gọi lại khi sessionData thay đổi

    const handleHideReplyMessage = () => {
        setShowReplyMessage(false);
        setReplyMessage(''); // Đặt lại nội dung tin nhắn trả lời
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const content = message;
        // console.log(content);
        // console.log(showReplyMessage);
        if(files.length > 0) {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('media', file);
            });
            formData.append('chatRoomId', chatRoomId.id);
            formData.append('senderId', localStorage.getItem('userId'));
            formData.append('content', content);
            // Kiểm tra nếu showReplyMessage là true thì mới thêm reply vào formData
            if (showReplyMessage) {
                formData.append('reply', replyMessage.messageId);
            }
            // console.log("this is form media", formData.getAll('media'));
            const res = await axios.post(process.env.REACT_APP_API_URL+'/api/send-media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': Cookies.get('authToken')
                }
            });
            // console.log(res);
            if(res.status === 200) {
                setPreviews([]);
                setFiles([]);
                setMessage('');
                handleHideReplyMessage();
                res.data.data.forEach((mediaData) => {
                    const data = {
                        chatRoomId: chatRoomId.id,
                        senderId: localStorage.getItem('userId'),
                        content: content,
                        media: mediaData.media,
                        type: mediaData.type
                    };
                    if (showReplyMessage) {
                        // data.reply =  replyMessage.messageId
                        data.reply =  replyMessage.messageContent
                    }
                    data.createAt = new Date();
                    socket.emit('message', data, mediaData._id);
                });
            }
        } else {
            if(content === '') return;
            // Kiểm tra nếu showReplyMessage là true thì mới thêm replyTo vào formData
            const data = {
                chatRoomId: chatRoomId.id,
                senderId: localStorage.getItem('userId'),
                content: content,
                createAt: new Date()
            };
            if (showReplyMessage) {
                // data.reply =  replyMessage.messageId
                data.reply =  replyMessage.messageContent
            }
            const res = await axiosClient.post(`/send-message`, { data });
            if(res.status === 200) {
                setMessage('');
                if(showReplyMessage)  handleHideReplyMessage();
            }
            socket.emit('message', data, res.data.data._id);
        }
        setTimeout(() => setIsSubmitting(false), 1000);
    };

    const triggerFileSelectPopup = () => fileInputRef.current.click();
    const handleImageChange = async (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const newFiles = Array.from(event.target.files);
            // setPreviews([]);
            // setFiles([]);
            newFiles.forEach((file) => {
                const reader = new FileReader();
                //accept="image/*, video/*, .pdf, .doc, .docx"
                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4'];
                if (true) {
                    if(file.size > 1024*1024*10) {
                        alert('File size should not exceed 10MB.');
                        return;
                    }
                    reader.onload = (e) => {
                        setPreviews(prevPreviews => [...prevPreviews, e.target.result]);
                    };
                    reader.readAsDataURL(file);
                    setFiles(prevFiles => [...prevFiles, file]);
                } else {
                    alert('Only PNG, JPEG, and JPG images and video/mp4 are allowed.');
                }
            });
        }
    };
    const handleRemoveImage = (index) => {
        setPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };
    return (
        <div className="">
            {replyMessage.messageContent!=='' && showReplyMessage && <Row
            className="position-absolute border rounded shadow px-2 bg-white"
            style={{right:'2%',bottom:'7%', width:'72%', height:'60px' }}
            >
                <Col md={11} lg={11} className="d-flex flex-column">
                    <b>Đang trả lời: </b>{replyMessage.messageContent}
                </Col>
                <Col md={1} lg={1} className="d-flex justify-content-center align-items-center">
                    <CloseButton aria-label="Hide" onClick={handleHideReplyMessage}/>
                </Col>
                {/* <Col md={1} lg={1}></Col> */}
            </Row>}
            <Stack direction="horizontal" gap={3} className="pe-2 border">
                <Form onSubmit={handleSubmit} className="w-100 d-flex border-0 justify-content-evenly align-items-center position-relative" encType="multipart/form-data">
                    <InputEmoji
                        value={message}
                        onChange={setMessage}
                        placeholder="Nhập tin nhắn..."
                        className="py-3 me-auto flex-grow-1 border-0"
                        style={{ outline: '', boxShadow: 'none'}}
                        onEnter={handleSubmit}
                    />
                    <Row xs={2} md={4} lg={6} style={{position: 'absolute', left: '0', bottom: '50px'}}>
                        {previews.map((preview, index) => (
                            <Col key={index}>
                                <Card className="mx-2 my-2 position-relative" style={{ width: '100px', height: '100px' }}>
                                    {files[index].type === 'video/mp4' && <Badge bg="infomation" className="position-absolute top-0 left-0 m-1">Video</Badge>}
                                    <Card.Img variant="top" src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <Button  style={{backgroundColor: 'transparent', padding: '0 5px'}} size="sm"  className="position-absolute top-0 left-0 m-1" onClick={() => handleRemoveImage(index)}>X</Button>
                                </Card>
                            </Col>
                        ))}
                        {/* <div className="d-flex justify-content-center align-items-center p-0 text-grey position-absolute" style={{right: '0', top: '50%'}}>
                            <span className="m-0 p-0">{previews.length>0 && `x${previews.length}`}</span>
                        </div> */}
                    </Row>
                    <Image className="mx-2" src={icons.voice} style={{ width: '25px', height: '25px' }} />
                    <Image className="mx-2" src={icons.image} style={{ width: '25px', height: '25px' }} onClick={triggerFileSelectPopup} />
                    <input type="file" name="media" id="media" accept="image/*, video/*, .pdf, .doc, .docx" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} multiple />
                </Form>
            </Stack>
        </div>

    );
};

export default InputArea;
