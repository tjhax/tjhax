const pool = require('../database/database.js');

// Get all conversations for a user
async function getConversations(user_id) {
  return pool.query(
    `SELECT conversations.convo_id, conversations.buyer_id, conversations.seller_id,
      conversations.listing_id, conversations.created_at, listings.title AS listing_title,
      listings.price AS listing_price,
      u_buyer.username AS buyer_username, u_seller.username AS seller_username
    FROM conversations
    JOIN listings ON conversations.listing_id = listings.listing_id
    JOIN users u_buyer  ON conversations.buyer_id  = u_buyer.user_id
    JOIN users u_seller ON conversations.seller_id = u_seller.user_id
    WHERE conversations.buyer_id = ? OR conversations.seller_id = ?
    ORDER BY conversations.created_at DESC`,
    [user_id, user_id]
  );
}

// Get all messages in a conversation
async function getMessagesByConvoId(conversation_id) {
  return pool.query(
    `SELECT messages.message_id, messages.convo_id, messages.author_id, messages.message_content, messages.created_at,
            users.username AS author_username
     FROM messages 
     JOIN users ON messages.author_id = users.user_id
     WHERE messages.convo_id = ?
     ORDER BY messages.created_at ASC`,
    [conversation_id]
  );
}

// Send a message
async function createMessage(convo_id, author_id, message_content) {
  return pool.query(
    `INSERT INTO messages (convo_id, author_id, message_content)
     VALUES (?, ?, ?)`,
    [convo_id, author_id, message_content]
  );
}

// Create a new conversation
async function createConversation(buyer_id, seller_id, listing_id) {
  return pool.query(
    `INSERT INTO conversations (buyer_id, seller_id, listing_id)
     VALUES (?, ?, ?)`,
    [buyer_id, seller_id, listing_id]
  );
}

// Check if conversation already exists
async function findConversation(user1_id, user2_id, listing_id) {
  return pool.query(
    `SELECT convo_id FROM conversations 
     WHERE listing_id = ?
     AND (
       (buyer_id = ? AND seller_id = ?)
       OR
       (buyer_id = ? AND seller_id = ?)
     )`,
    [listing_id, user1_id, user2_id, user2_id, user1_id]
  );
}

// Delete all messages tied to a listing (via its conversations)
async function deleteMessagesByListingId(listing_id) {
  return pool.query(
    `DELETE messages FROM messages
     JOIN conversations ON messages.convo_id = conversations.convo_id
     WHERE conversations.listing_id = ?`,
    [listing_id]
  );
}

// Delete all conversations tied to a listing
async function deleteConversationsByListingId(listing_id) {
  return pool.query(
    `DELETE FROM conversations WHERE listing_id = ?`,
    [listing_id]
  );
}

module.exports = { getConversations, getMessagesByConvoId, createMessage, createConversation, findConversation, deleteConversationsByListingId, deleteMessagesByListingId };