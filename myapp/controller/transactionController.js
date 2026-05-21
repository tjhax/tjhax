const transactionModel = require('../model/transactionModel.js');

// POST /api/transactions
// Creates a transaction record when an item is sold
async function createTransaction(req, res) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const { listing_id, seller_id, buyer_id, price, status } = req.body;

    if (!listing_id || !seller_id || !buyer_id || price === undefined || !status) {
        return res.status(400).json({ error: 'listing_id, seller_id, buyer_id, price, and status are required.' });
    }

    try {
        const result = await transactionModel.createTransaction(listing_id, seller_id, buyer_id, price, status);
        return res.status(201).json({
            message:        'Transaction recorded successfully.',
            transaction_id: result.insertId,
            listing_id,
            seller_id,
            buyer_id,
            price,
            status
        });
    } catch (err) {
        console.error('[createTransaction]', err);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
}

// GET /api/transactions/seller/:seller_id
// Returns all transactions for a seller — used for the sold items count on account page
async function getSellerTransactions(req, res) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const sellerId = parseInt(req.params.seller_id, 10);

    if (isNaN(sellerId)) {
        return res.status(400).json({ error: 'Invalid seller ID.' });
    }

    try {
        const transactions = await transactionModel.getTransactionsBySeller(sellerId);
        return res.status(200).json({
            transactions,
            sold_count: transactions.filter(t => t.status === 'Completed').length
        });
    } catch (err) {
        console.error('[getSellerTransactions]', err);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
}

// GET /api/transactions/buyer/:buyer_id
// Returns all transactions for a buyer
async function getBuyerTransactions(req, res) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const buyerId = parseInt(req.params.buyer_id, 10);

    if (isNaN(buyerId)) {
        return res.status(400).json({ error: 'Invalid buyer ID.' });
    }

    try {
        const transactions = await transactionModel.getTransactionsByBuyer(buyerId);
        return res.status(200).json({
            transactions,
            purchased_count: transactions.filter(t => t.status === 'Completed').length
        });
    } catch (err) {
        console.error('[getBuyerTransactions]', err);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
}

// GET /api/transactions?user_id=X
// Returns all transactions for a user with listing title, type, and other user's username
async function getUserTransactions(req, res) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const userId = parseInt(req.query.user_id, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID.' });
    }

    try {
        const rows = await transactionModel.getTransactionsByUser(userId);

        const transactions = rows.map(transaction => ({
            id:         transaction.id,
            listing_id: transaction.listing_id,
            title:      transaction.title,
            price:      transaction.price,
            date:       new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status:     transaction.status,
            type:       transaction.type,
            other_user: transaction.other_user,
            photo:  transaction.photo_url ? `/${transaction.photo_url}` : null
        }));

        return res.status(200).json({ transactions });
    } catch (err) {
        console.error('[getUserTransactions]', err);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
}

module.exports = { createTransaction, getSellerTransactions, getBuyerTransactions, getUserTransactions };
