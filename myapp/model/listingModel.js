const pool = require('../database/database.js');

async function getListing() {
    return pool.query(
            `SELECT listing_id, seller_id, title, description, tags, status, price, created_at, \`condition\`, location
            FROM listings
            WHERE status = 'Active'
            ORDER BY price`
    );
}

async function filterTag(tag) {
    return pool.query(
            `SELECT listing_id, seller_id, title, description, tags, status, price, created_at, \`condition\`, location
             FROM listings
             WHERE tags LIKE ? AND status = 'Active'
             ORDER BY price`,
             [`%${tag}%`]
    );
}

async function filterQuery(query) {
    return pool.query(
            `SELECT listing_id, seller_id, title, description, tags, status, price, created_at, \`condition\`, location
             FROM listings
             WHERE title LIKE ? AND status = 'Active'
             ORDER BY price`,
             [`%${query}%`]
    );
}

async function idQuery(listingId) {
    return pool.query(
            `SELECT l.listing_id, l.seller_id, l.title, l.description, l.tags, l.status,
                    l.price, l.created_at, l.\`condition\`, l.location,
                    u.username AS seller_username
             FROM listings l
             LEFT JOIN users u ON l.seller_id = u.user_id
             WHERE l.listing_id = ?`,
            [listingId]
    );
}

 async function createListing(seller_id, title, description, tags, price, condition, location){
     return pool.query(
       `INSERT INTO listings (seller_id, title, description, tags, price, status, \`condition\`, location)
        VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)`,
        [seller_id, title, description, tags, price, condition, location]
     );
 }

async function updateStatus(listingId, status) {
    return pool.query(
        `UPDATE listings SET status = ? WHERE listing_id = ?`,
        [status, listingId]
    );
}

async function deleteById(listingId) {
    return pool.query(
        `DELETE FROM listings WHERE listing_id = ?`,
        [listingId]
    );
}

async function updateListing(listing_id, title, tags, condition, price, description, location) {
    pool.query(
    'UPDATE listings SET title = ?, tags = ?, \`condition\` = ?, price = ?, description = ?, location = ? WHERE listing_id = ?',
    [title, tags, condition, price, description, location, listing_id]
    );
}

module.exports = {
    getListing, filterQuery, filterTag, idQuery, createListing,
    updateStatus, deleteById, updateListing
}
