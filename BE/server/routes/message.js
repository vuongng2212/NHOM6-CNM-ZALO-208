const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// ... existing routes ...

// Gửi vị trí
router.post('/send-location', authenticateToken, messageController.sendLocation);

// Tạo vote
router.post('/create-vote', authenticateToken, messageController.createVote);

// Bỏ phiếu
router.post('/cast-vote', authenticateToken, messageController.castVote);

module.exports = router; 