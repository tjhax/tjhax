const pool = require('../database/database.js');

// Create a new transaction
async function createTransaction(listing_id, seller_id, buyer_id, price, status) {
    const [result] = await pool.query(
        `INSERT INTO transactions (listing_id, seller_id, buyer_id, price, status)
         VALUES (?, ?, ?, ?, ?)`,
        [listing_id, seller_id, buyer_id, price, status]
    );
    return result;
}

// Get all transactions for a seller (for account page sold count)
async function getTransactionsBySeller(seller_id) {
    const [rows] = await pool.query(
        `SELECT transaction_id, listing_id, buyer_id, price, status, created_at
         FROM transactions
         WHERE seller_id = ?
         ORDER BY created_at DESC`,
        [seller_id]
    );
    return rows;
}

// Get all transactions for a buyer
async function getTransactionsByBuyer(buyer_id) {
    const [rows] = await pool.query(
        `SELECT transaction_id, listing_id, seller_id, price, status, created_at
         FROM transactions
         WHERE buyer_id = ?
         ORDER BY created_at DESC`,
        [buyer_id]
    );
    return rows;
}

// Get all transactions for a user (both bought and sold) with listing title, photo, and other user's username
async function getTransactionsByUser(user_id) {
    const [rows] = await pool.query(
        `SELECT
            transaction.transaction_id                                              AS id,
            transaction.listing_id,
            listing.title,
            transaction.price,
            transaction.created_at                                                  AS date,
            transaction.status,
            CASE WHEN transaction.seller_id = ? THEN 'Sold' ELSE 'Bought' END      AS type,
            CASE WHEN transaction.seller_id = ? THEN buyer.username
                 ELSE seller.username END                                           AS other_user,
            MIN(photo.image_file_path)                                              AS photo_url
         FROM transactions transaction
         JOIN listings  listing  ON transaction.listing_id = listing.listing_id
         JOIN users     buyer    ON transaction.buyer_id   = buyer.user_id
         JOIN users     seller   ON transaction.seller_id  = seller.user_id
         LEFT JOIN photos photo  ON transaction.listing_id = photo.listing_id
         WHERE transaction.seller_id = ? OR transaction.buyer_id = ?
         GROUP BY transaction.transaction_id, listing.title, transaction.price,
                  transaction.created_at, transaction.status, buyer.username, seller.username
         ORDER BY transaction.created_at DESC`,
        [user_id, user_id, user_id, user_id]
    );
    return rows;
}

module.exports = { createTransaction, getTransactionsBySeller, getTransactionsByBuyer, getTransactionsByUser };
