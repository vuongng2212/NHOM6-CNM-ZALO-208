const Message = require("../models/message");
const ChatRoom = require("../models/chatRoom");
const User = require("../models/user")
const Direct = require("../models/direct");
const Group = require("../models/group");
const GroupDetail = require('../models/groupDetail');

const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();
const { Types } = require('mongoose');

require('dotenv').config();
const AWS = require('aws-sdk');
const { S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

const getMessage = async (req, res) => {
  const id = req.params.id;

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json(apiCode.error("Message not found"));
    }
    else {
      return res.status(200).json(apiCode.success(message, "Get Message Success"));
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try{
    const chatRoomId = req.params.chatRoomId;
    const direct = await Direct.findOne({ receiverId: { $ne: req.user.id }, chatRoomId: chatRoomId });
    const group = await Group.findOne({chatRoomId: chatRoomId}) || null
    const chatRoom = await ChatRoom.findById(chatRoomId);
    // console.log(chatRoom);
    if(!chatRoom || (!direct && !group) || !chatRoom.messages || chatRoom.messages.length === 0 || !chatRoom.messages[0]){
      console.log('Messages not found');
      return res.status(404).json(apiCode.error('Messages not found'));
    }
    else{
      const messages = await Message.find({ _id: { $in: chatRoom.messages } });
      const senderIds = new Set(messages.map(message => message.senderID)); // Lấy tất cả các senderId

      // Tạo một đối tượng tạm thời để lưu trữ thông tin người gửi đã được truy vấn trước đó
      const senderInfoCache = {};

      // Duyệt qua từng senderId và kiểm tra xem thông tin đã được truy vấn trước đó hay chưa
      await Promise.all(Array.from(senderIds).map(async (senderId) => {
        if (!senderInfoCache[senderId]) {
            const sender = await User.findById(senderId, 'displayName photoURL');
            senderInfoCache[senderId] = sender;
        }
      }));

      const messageList = await Promise.all(messages.map( async message => {
        const sender = senderInfoCache[message.senderID];
        return {
          id: message._id,
          content: message.content,
          isSent: req.user.id === message.senderID.toString(),
          // lấy thông tin người gửi
          sent: message.senderID,
          isSent: req.user.id === message.senderID.toString(),
          reply: message.reply,
          senderName: sender.displayName,
          avatarSender: sender.photoURL,
          unsent: message.isDeleted,
          isForwarded: message.isForwarded? true : false,
          time: message.createAt.getHours() + ':' + message.createAt.getMinutes(),
          reactions: message.reactions,
          hided: message.hidedUsers.includes(new Types.ObjectId(req.user.id)),
          type: message.type,
          media: message.media,
          pin: message.pin
        }
      }))
      if(direct){
        direct.unreadMessageCount = 0;
        await direct.save();
      }
      if (group) {
        // Reset unreadMessageCount về 0 cho user hiện tại
        const groupDetail = await GroupDetail.findOne({ groupId: group._id, userId: req.user.id });
        if (groupDetail) {
          groupDetail.unreadMessageCount = 0;
          await groupDetail.save();
        }
      }
      return res.status(200).json(apiCode.success(messageList, 'Get Messages Success'));
    }
  }catch(error){
    res.status(500).json({ message: error.message });
  }
};

// const getMessages = async (req, res) => {
//   try {
//     const chatRoomId = req.params.chatRoomId;
//     const chatRoom = await ChatRoom.findById(chatRoomId);
//     const messages = await Message.find({ _id: { $in: chatRoom.messages } });
//     let sent = true;
//     const messageList = messages.map(message => {
//       return {
//         id: message._id,
//         content: message.content,
//         sent: sent = !sent,
//         time: message.createAt.getHours() + ':' + (message.createAt.getMinutes() < 10 ? '0' + message.createAt.getMinutes() : message.createAt.getMinutes())
//       }
//     });
//     return res.status(200).json(apiCode.success(messageList, 'Get Messages Success'));
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const searchMessages = async (req, res) => {
  const chatRoomId = req.params.chatRoomId;
  const keyword = req.query._q;
  const chatRoom = await ChatRoom.findById(chatRoomId);
  const messages = await Message.find({ _id: { $in: chatRoom.messages }, content: { $regex: keyword, $options: 'i' } });
  const messageList = messages.map(message => {
    return {
      index: messages.indexOf(message),
      id: message._id,
      content: message.content,
      time: message.createAt.getHours() + ':' + (message.createAt.getMinutes() < 10 ? '0' + message.createAt.getMinutes() : message.createAt.getMinutes())
    }
  });
  return res.status(200).json(apiCode.success(messageList, 'Search Messages Success'));
};

const sendMessage = async (req, res) => {
  // Lấy dữ liệu từ client gửi lên
  const { chatRoomId, content, reply } = req.body.data;
  // tải lại model ChatRoom 
  const ChatRoom = require('../models/chatRoom');
  // Kiểm tra đây là cuộc trò chuyện trực tiếp (Direct) hay nhóm (Group)
  const direct = await Direct.findOne({ receiverId: { $eq: req.user.id }, chatRoomId: chatRoomId });
  const group = await Group.findOne({ chatRoomId: chatRoomId }) || null;
  // Tạo một tin nhắn mới
  const newMessage = new Message({
    senderID: req.user.id,     // Người gửi là người đang đăng nhập
    content: content,          // Nội dung tin nhắn được nhập từ người dùng
    reply: reply               // Nếu có đang trả lời tin nhắn nào, đây là ID của tin gốc
                               // Nếu không reply thì giá trị này sẽ là null hoặc undefined
  });
  console.log(newMessage); // In ra để kiểm tra message mới (debug)
  // Lưu tin 
  const message = await newMessage.save();
  // Tìm phòng chat tương ứng để cập nhật danh sách tin nhắn
  const chatRoom = await ChatRoom.findById(chatRoomId);
  chatRoom.messages.push(message._id);        // Thêm ID tin nhắn vào mảng messages của phòng chat
  chatRoom.lastMessage = message._id;         // LUÔN cập nhật tin nhắn cuối cùng của phòng (cả nhóm và 1-1)
  // Nếu đây là direct chat, tăng số tin chưa đọc
  if (direct) {
    direct.unreadMessageCount += 1;           // Tăng số lượng tin chưa đọc cho phía người nhận
    await direct.save();                      // Lưu lại thay đổi
  }
  // Nếu đây là nhóm, chỉ cần lưu lại
  if (group) {
    // Lấy tất cả GroupDetail của nhóm này
    const groupDetails = await GroupDetail.find({ groupId: group._id });
    for (const groupDetail of groupDetails) {
      // Tìm userId của groupDetail (bạn cần lưu userId trong GroupDetail khi tạo nhóm)
      // Giả sử bạn có trường userId trong GroupDetail, nếu chưa có thì cần bổ sung!
      if (groupDetail.userId && groupDetail.userId.toString() !== req.user.id.toString()) {
        groupDetail.unreadMessageCount += 1;
        await groupDetail.save();
      }
    }
  }
  await chatRoom.save();
  return res.status(200).json(apiCode.success(message, 'Send Message Success'));
};


const sendMedia = async (req, res) => {
  const media  = req.files;
  const { chatRoomId, content } = req.body;
  const uploadPromises = media.map(async file => {
    const filePath = `${Date.now().toString()}.${file.size}.${file?.originalname}`;
    const uploadParams = {
        Bucket: S3_BUCKET_NAME,
        Key: filePath,
        Body: file.buffer, // Assuming multer is configured to store file buffer
        ACL: 'public-read',
        ContentType: file.mimetype,
    };
    try {
        const s3Data = await s3.upload(uploadParams).promise();
        return {
            // senderID: req.user.id,
            type: file.mimetype.includes('image') ? 'image' : file.mimetype.includes('video') ? 'video' : 'file',
            media: {
                name: file?.originalname,
                type: file.mimetype,
                size: file.size,
                url: s3Data.Location
            }
        };
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error; // Propagate the error to the caller
    }
  });
  try {
      const uploadedMessages = await Promise.all(uploadPromises);
      const newMessages = uploadedMessages.map((media, index) => {
          return new Message({
              senderID: req.user.id,
              content: index === uploadedMessages.length - 1 ? content : '',
              type: media.type,
              media: media.media
          });
      });
      console.log("newMessages", newMessages)
      const messages = await Message.insertMany(newMessages);
      const chatRoom = await ChatRoom.findById(chatRoomId);
      chatRoom.messages.push(...messages.map(message => message._id));
      chatRoom.lastMessage = messages[messages.length - 1]._id; // LUÔN cập nhật tin nhắn cuối cùng của phòng (cả nhóm và 1-1)
      await chatRoom.save();
      return res.status(200).json(apiCode.success(messages, 'Send Media Success'));
  } catch (error) {
      console.error('Error uploading one or more files to S3:', error);
      return res.status(500).json(apiCode.error('Error uploading files to S3'));
  }
}

const unsentMessage = async (req, res) => {
  const id = req.params.id;
  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json(apiCode.error("Message not found"));
    }
    else {
      message.isDeleted = true;
      await message.save();
      return res.status(200).json(apiCode.success(message, "Unsent Message Success"));
    }
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reactMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { reaction } = req.body.data;
    const validReactions = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!validReactions.includes(reaction)) {
      return res.status(400).json(apiCode.error("Invalid reaction"));
    }
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json(apiCode.error("Message not found"));
    }
    const userId = req.user.id;
    const userReactions = message.reactions;
  //   reactions: [{
  //     userId: Types.ObjectId,
  //     reaction: {
  //         type: String,
  //         default: ''
  //     }
  // }],
    const userReaction = userReactions.find(reaction => reaction.userId.toString() === userId);
    if (userReaction) {
      userReaction.reaction = reaction;
    } else {
      userReactions.push({ userId, reaction });
    }
    message.reactions = userReactions;
    await message.save();
    return res.status(200).json(apiCode.success(message, "React Message Success"));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forwardMessage = async (req, res) => {
  const id = req.params.id;
  const { chatRoomId } = req.body.data;
  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json(apiCode.error("Message not found"));
    }
    else {
      const newMessage = new Message({
        senderID: req.user.id,
        content: message.content,
        type: message.type,
        media: message.media,
        isForwarded: true
      });
      const chatRoom = await ChatRoom.findById(chatRoomId);
      chatRoom.messages.push(newMessage._id);
      chatRoom.lastMessage = newMessage._id;
      await newMessage.save();
      await chatRoom.save();
      return res.status(200).json(apiCode.success(newMessage, "Forward Message Success"));
    }
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const hideMessage = async (req, res) => {
  const id = req.params.id;
  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json(apiCode.error("Message not found"));
    }
    else {
      message.hidedUsers.push(req.user.id);
      await message.save();
      return res.status(200).json(apiCode.success(message, "Hide Message Success"));
    }
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  const id = req.params.id;
  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json(apiCode.error("Message not found"));
    }else {
      const chatRoom = await ChatRoom.findOne({ messages: { $in: [id] } });
      chatRoom.messages = chatRoom.messages.filter(messageId => messageId.toString() !== id);
      chatRoom.lastMessage = chatRoom.messages[chatRoom.messages.length - 1];
      //how to delete a message in Message collection:
      await message.deleteOne();
      await chatRoom.save();

      return res.status(200).json(apiCode.success(message, "Delete Message Success"));
    }
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const pinMessage = async (req, res) => {
  const id = req.params.id; // Lấy id của tin nhắn từ yêu cầu
  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json(apiCode.error("Message not found"));
    } else {
      // Cập nhật trạng thái pin của tin nhắn trong cơ sở dữ liệu
      message.pin = true;
      await message.save();

      return res.status(200).json(apiCode.success(message, "Pin Message Success"));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const unPinMessage = async (req, res) => {
  const id = req.params.id; // Lấy id của tin nhắn từ yêu cầu
  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json(apiCode.error("Message not found"));
    } else {
      // Cập nhật trạng thái pin của tin nhắn trong cơ sở dữ liệu
      message.pin = false;
      await message.save();

      return res.status(200).json(apiCode.success(message, "UnPin Message Success"));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Gửi vị trí
const sendLocation = async (req, res) => {
  try {
    const { chatRoomId, latitude, longitude, address } = req.body.data;
    
    const newMessage = new Message({
      senderID: req.user.id,
      type: 'location',
      location: {
        latitude,
        longitude,
        address
      }
    });

    const message = await newMessage.save();
    
    // Cập nhật phòng chat
    const chatRoom = await ChatRoom.findById(chatRoomId);
    chatRoom.messages.push(message._id);
    chatRoom.lastMessage = message._id;
    await chatRoom.save();

    // Cập nhật số tin nhắn chưa đọc
    const direct = await Direct.findOne({ receiverId: { $eq: req.user.id }, chatRoomId: chatRoomId });
    if (direct) {
      direct.unreadMessageCount += 1;
      await direct.save();
    }

    return res.status(200).json(apiCode.success(message, 'Send location success'));
  } catch (error) {
    console.error('Send location error:', error);
    return res.status(500).json(apiCode.error('Send location failed'));
  }
};

// Tạo vote
const createVote = async (req, res) => {
  try {
    const { chatRoomId, question, options, endTime, isMultipleChoice } = req.body.data;
    
    const newMessage = new Message({
      senderID: req.user.id,
      type: 'vote',
      vote: {
        question,
        options: options.map(opt => ({
          text: opt,
          votes: []
        })),
        endTime: endTime ? new Date(endTime) : null,
        isMultipleChoice
      }
    });

    const message = await newMessage.save();
    
    // Cập nhật phòng chat
    const chatRoom = await ChatRoom.findById(chatRoomId);
    chatRoom.messages.push(message._id);
    chatRoom.lastMessage = message._id;
    await chatRoom.save();

    // Cập nhật số tin nhắn chưa đọc
    const direct = await Direct.findOne({ receiverId: { $eq: req.user.id }, chatRoomId: chatRoomId });
    if (direct) {
      direct.unreadMessageCount += 1;
      await direct.save();
    }

    return res.status(200).json(apiCode.success(message, 'Create vote success'));
  } catch (error) {
    console.error('Create vote error:', error);
    return res.status(500).json(apiCode.error('Create vote failed'));
  }
};

// Bỏ phiếu
const castVote = async (req, res) => {
  try {
    const { messageId, optionIndex } = req.body;
    
    const message = await Message.findById(messageId);
    if (!message || message.type !== 'vote') {
      return res.status(400).json(apiCode.error('Invalid message or message type'));
    }

    // Kiểm tra thời gian kết thúc
    if (message.vote.endTime && new Date() > message.vote.endTime) {
      return res.status(400).json(apiCode.error('Vote has ended'));
    }

    // Kiểm tra option index hợp lệ
    if (optionIndex < 0 || optionIndex >= message.vote.options.length) {
      return res.status(400).json(apiCode.error('Invalid option'));
    }

    // Kiểm tra người dùng đã vote chưa
    const hasVoted = message.vote.options.some(option => 
      option.votes.some(vote => vote.userId.toString() === req.user.id)
    );

    if (hasVoted && !message.vote.isMultipleChoice) {
      return res.status(400).json(apiCode.error('You have already voted'));
    }

    // Thêm vote
    message.vote.options[optionIndex].votes.push({
      userId: req.user.id,
      votedAt: new Date()
    });

    await message.save();
    return res.status(200).json(apiCode.success(message, 'Vote cast successfully'));
  } catch (error) {
    console.error('Cast vote error:', error);
    return res.status(500).json(apiCode.error('Cast vote failed'));
  }
};

module.exports = {
  getMessage,
  getMessages,
  searchMessages,
  sendMessage,
  sendMedia,
  unsentMessage,
  reactMessage,
  forwardMessage,
  hideMessage,
  deleteMessage,
  pinMessage,
  unPinMessage,
  sendLocation,
  createVote,
  castVote
}