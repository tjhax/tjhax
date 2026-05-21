const pool = require('../database/database.js');

async function getListingsByUser(userId) {
    return pool.query(
        `SELECT listing_id, seller_id, title, description, tags, status, price, \`condition\`, created_at
         FROM listings
         WHERE seller_id = ?
         ORDER BY created_at DESC`,
        [userId]
    );
}

module.exports = { getListingsByUser };
