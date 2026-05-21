const myListingsModel = require('../model/my-listingsModel.js');

async function getMyListings(req, res) {
    const userId = parseInt(req.query.user_id, 10);

    if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
}

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user_id.' });
    }

    try {
        const [rows] = await myListingsModel.getListingsByUser(userId);
        return res.status(200).json({ listings: rows });
    } catch (err) {
        console.error('[getMyListings]', err);
        return res.status(500).json({ error: 'Server error.' });
    }
}
//delete own listings ?
module.exports = { getMyListings };
