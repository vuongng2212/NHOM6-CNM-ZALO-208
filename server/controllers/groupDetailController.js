const GroupDetail = require('../models/groupDetail');
const Group = require('../models/group');
const User = require('../models/user');

const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();

///	Lấy chi tiết nhóm theo id
//Dùng Group.findById(id) để tìm nhóm theo ID
const getGroupDetail = async (req, res) => {
    const id = req.params.id;

    try {
        const groupDetail = await Group
            .findById(id)
            .populate('groupDetails')
            .exec();
        if (!groupDetail) {
            return res.status(404).json(apiCode.error('GroupDetail not found'));
        }
        return res.status(200).json(apiCode.success(groupDetail, 'Get GroupDetail Success'));//Nếu có, trả về mã thành công 200 và dữ liệu nhóm.
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
///Lấy tất cả nhóm mà người dùng đang tham gia
//Lấy toàn bộ chi tiết các nhóm mà người dùng hiện tại đang tham gia, từ bảng GroupDetail Khi người dùng mở app, cần hiển thị danh sách nhóm đã tham gia
const getGroupDetails = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);//Truy vấn người dùng với User.findById(userId).
    if(user.groupDetails.length === 0){
        return res.status(404).json(apiCode.error('GroupDetails not found'));
    }
    else{
        const groupDetails = await GroupDetail.find({ _id: { $in: user.groupDetails } });//Ngược lại, tìm toàn bộ GroupDetail có _id nằm trong mảng user.groupDetails
        res.status(200).json(apiCode.success(groupDetails, 'Get GroupDetails Success'));
    }
};

module.exports = {
    getGroupDetail,
    getGroupDetails
};