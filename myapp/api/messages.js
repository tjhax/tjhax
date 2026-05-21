const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController.js');

// /api/messages
router.get('/conversations', messageController.messagePage); 

router.get('/:conversation_id', messageController.convoId); 

router.get('/', messageController.getMessages); 

router.post('/', messageController.msg); 

module.exports = router;
