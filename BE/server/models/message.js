const Mongoose = require('mongoose');
const { Schema, Types } = Mongoose;

const MessageSchema = new Schema({
    senderID: Types.ObjectId,
    content: {
        type: String,
        default: ''
    },
    counter: {
        type: Number,
        default: function() {
            return this.content.length;
        }
    },
    reply: {
        type: String,
        default: ''
    },
    pin: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: ''
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    },
    reactions: [{
        userId: Types.ObjectId,
        reaction: {
            type: String,
            default: ''
        }
    }],
    media:  {
        name: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ''
        },
        size: {
            type: Number,
            default: 0
        },
        url: {
            type: String,
            default: ''
        }
    },
    readUsers: [{
        type: Schema.Types.Mixed
    }],
    isForwarded: {
        type: Boolean,
        default: false
    },
    hidedUsers: [{
        type: Schema.Types.Mixed
    }],
    location: {
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        },
        address: {
            type: String,
            default: ''
        }
    },
    vote: {
        question: {
            type: String,
            default: ''
        },
        options: [{
            text: String,
            votes: [{
                userId: Types.ObjectId,
                votedAt: {
                    type: Date,
                    default: Date.now
                }
            }]
        }],
        endTime: {
            type: Date,
            default: null
        },
        isMultipleChoice: {
            type: Boolean,
            default: false
        }
    }
});

module.exports = Mongoose.model('Message', MessageSchema, 'messages');
