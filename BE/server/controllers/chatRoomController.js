const Direct = require('../models/direct');
const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();
const ChatRoom = require('../models/chatRoom');


//Lấy chi tiết phòng chat theo id (ID của chính ChatRoom).
const getChatRoom = async (req, res) => {
    const id = req.params.id;

    try {
        const chatRoom = await ChatRoom.findById(id);//Dùng ChatRoom.findById(id) để tìm phòng cha
        if (!chatRoom) {
            return res.status(404).json(apiCode.error('ChatRoom not found'));
        }

        res.status(200).json(apiCode.success(chatRoom, 'Get ChatRoom Success'));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//Lấy phòng chat thông qua DirectId — tức là khi có một mối quan hệ "trực tiếp" giữa hai người (giống kiểu nhắn tin 1-1).
const getChatRoomByDirectId = async (req, res) => {
    const directId = req.params.directId;
    const direct = await Direct.findById(directId);
    try{
        const chatRoom = await ChatRoom.findById(direct.chatRoomId);
        res.status(200).json(apiCode.success(chatRoom, 'Get ChatRoom Success'));
    }catch (error) {
        res.status(500).json(apiCode.error('Get ChatRoom Failed'));
    }
};


const getMessagesByChatRoom = async (req, res) => {
    try {
        const chatRoomId = req.params.chatRoomId;
        const chatRoom = await ChatRoom.findById(chatRoomId).populate('messages');
        
        if (!chatRoom) {
            return res.status(404).json(apiCode.error('ChatRoom not found'));
        }

        // Sắp xếp tin nhắn từ cũ đến mới
        const messages = chatRoom.messages.sort((a, b) => a.createAt - b.createAt);
        
        res.status(200).json(apiCode.success(messages, 'Get messages success'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getChatRoom,
    getChatRoomByDirectId
};