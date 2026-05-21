const messageModel = require('../model/messageModel.js');
const { broadcastToConvo, broadcastToConvoExcept, notifyUser } = require('../websocket.js');

// GET /api/messages/conversations
// Get all conversations for the logged in user
async function messagePage(req, res) {
  const user_id = req.session.userId || parseInt(req.query.user_id, 10);

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
}

  if (!user_id) {
    return res.status(401).json({ error: 'You must be logged in to view conversations.' });
  }

  try {
    const [rows] = await messageModel.getConversations(user_id);

    if (rows.length === 0) {
      return res.status(200).json({ message: 'No conversations found.' });
    }

    return res.status(200).json({ conversations: rows });

  } catch (err) {
    console.error('[messagePage]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

// GET /api/messages/:conversation_id
// Get all messages in a specific conversation
async function convoId(req, res) {
  const conversation_id = parseInt(req.params.conversation_id, 10);
  const user_id = req.session.userId;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
}

  if (!user_id) {
    return res.status(401).json({ error: 'You must be logged in to view messages.' });
  }

  if (isNaN(conversation_id)) {
    return res.status(400).json({ error: 'Invalid conversation ID.' });
  }

  try {
    const [rows] = await messageModel.getMessagesByConvoId(conversation_id);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No messages found in this conversation.' });
    }

    return res.status(200).json({ messages: rows });

  } catch (err) {
    console.error('[convoId]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

// POST /api/messages
// Send a message — creates a conversation if one doesn't exist yet
async function msg(req, res) {
  const { seller_id, listing_id, message_content } = req.body;
  const author_id = req.session.userId;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
}

  if (!author_id) {
    return res.status(401).json({ error: 'You must be logged in to send a message.' });
  }

  if (!seller_id || !listing_id || !message_content) {
    return res.status(400).json({ error: 'seller_id, listing_id, and message_content are required.' });
  }

  if (author_id === parseInt(seller_id, 10)) {
    console.log("hello");
    return res.status(400).json({ error: 'You cannot message yourself.' });
  }

  try {
    // Check if conversation already exists
    let [convo] = await messageModel.findConversation(author_id, seller_id, listing_id);
    let convo_id;

    if (convo.length === 0) {
      // Create a new conversation
      const [newConvo] = await messageModel.createConversation(author_id, parseInt(seller_id, 10), parseInt(listing_id, 10));
      convo_id = newConvo.insertId;
    } else {
      convo_id = convo[0].convo_id;
    }

    // Send the message
    const [result] = await messageModel.createMessage(convo_id, author_id, message_content);

    // Broadcast new message to everyone in this conversation room
    broadcastToConvo(convo_id, {
      type:     'new_message',
      convo_id,
      message: {
        message_id:      result.insertId,
        author_id,
        author_username: req.session.username,
        message_content,
        created_at:      new Date().toISOString()
      }
    });

    // Notify the OTHER person's conversation list to update (not the sender — they already have it)
    broadcastToConvoExcept(convo_id, { type: 'convo_updated', convo_id }, author_id);

    // Directly notify the recipient even if they are not in the conversation room (e.g. on another page)
    const recipient_id = parseInt(seller_id, 10);
    notifyUser(recipient_id, {
      type:     'new_message',
      convo_id,
      message: {
        message_id:      result.insertId,
        author_id,
        author_username: req.session.username,
        message_content,
        created_at:      new Date().toISOString()
      }
    });

    return res.status(201).json({
      message:    'Message sent successfully.',
      message_id: result.insertId,
      convo_id,
      author_id,
      message_content
    });

  } catch (err) {
    console.error('[msg]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

async function getMessages(req, res) {
  return messagePage(req, res);
}

module.exports = { messagePage, convoId, msg, getMessages };