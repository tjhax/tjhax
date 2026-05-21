const fs           = require('fs');
const path         = require('path');
const listingModel = require('../model/listingModel.js');
const photoModel   = require('../model/photoModel');
const messageModel = require('../model/messageModel.js');

async function viewListing(req, res){
    try {
        const [rows] = await listingModel.getListing();
        return res.status(200).json({
        message: "All active listings displayed",
        listings: rows
        });
    }
    catch (err) {
        console.error('[register]', err);
        return res.status(500).json({ error: 'Server error. Please try again laterRRRRRRRR1.' });
    }
}

async function search(req, res) {
    const {query, tag} = req.query;
    let rows;
    try {
        let result;
        if (query) {
            result = await listingModel.filterQuery(query);
        } else {
            result = await listingModel.filterTag(tag);
        }
        const [rows] = result;
        if (rows.length === 0) {
        return res.status(404).json({ error: 'No listings found.' });
        }
        return res.status(200).json({ listings: rows });
    }
    catch (err) {
        console.error('[listings search]', err);
        return res.status(500).json({ error: 'Server error. Please try again later2.' });
    }
}

async function idSearch(req, res){
    const listingId = parseInt(req.params.id, 10);

    //If listing ID is null, error message
    if (isNaN(listingId)) {
        return res.status(400).json({ error: 'Invalid listing ID.' });
    }

  try {
    const [rows] = await listingModel.idQuery(listingId);
    if (rows.length === 0) {
    return res.status(404).json({ error: 'Listing not found.' });
    }
    return res.status(200).json({ listing: rows[0] });
  }
  catch (err) {
    console.error('[listings GET one]', err);
    return res.status(500).json({ error: 'Server error. Please try again later3.' });
  }
}

async function createListing(req, res) {
  const { seller_id, title, description, tags, price, condition, location, status } = req.body;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
}

  const finalStatus = status === 'Draft' ? 'Draft' : 'Active';

  if (finalStatus !== 'Draft' && (!seller_id || !title || !description || price === undefined || price === null || price === "" || !condition || !location)) {
    return res.status(400).json({ error: 'seller_id, title, description, price, and condition are required.' });
  }

  try {
    const [result] = await listingModel.createListing(seller_id, title, description, tags, price, condition, location, finalStatus);
    return res.status(201).json({
      message: 'Listing created successfully.',
      listing_id: result.insertId,
      seller_id,
      title,
      description,
      tags: tags,
      price,
      condition,
      location,
      status: finalStatus
    });
  } catch (err) {
    console.error('[createListing]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

async function updateStatus(req, res) {
  const listingId = parseInt(req.params.id, 10);
  const { status } = req.body;
  const allowed = ['Active', 'Sold', 'Pending', 'Draft'];

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
}

  if (isNaN(listingId)) return res.status(400).json({ error: 'Invalid listing ID.' });
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

  try {
    await listingModel.updateStatus(listingId, status);
    return res.status(200).json({ message: 'Status updated.', listing_id: listingId, status });
  } catch (err) {
    console.error('[updateStatus]', err);
    return res.status(500).json({ error: 'Server error.' });
  }
}

async function deleteListing(req, res) {
  const listingId = parseInt(req.params.id, 10);
  const userId    = req.session.userId;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
}

  if (!userId) {
    return res.status(401).json({ error: 'You must be logged in to delete a listing.' });
  }

  if (isNaN(listingId)) {
    return res.status(400).json({ error: 'Invalid listing ID.' });
  }

  try {
    // Make sure the listing exists and belongs to this seller
    const [rows] = await listingModel.idQuery(listingId);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (rows[0].seller_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this listing.' });
    }

    // 1. Delete all messages in conversations tied to this listing
    await messageModel.deleteMessagesByListingId(listingId);

    // 2. Delete all conversations tied to this listing
    await messageModel.deleteConversationsByListingId(listingId);

    // Delete each photo file from disk and its database record
    const photos = await photoModel.getPhotosByListing(listingId);
    for (const photo of photos) {
      const filePath = path.join(__dirname, '..', 'views', 'uploads', photo.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error(`[deleteListing] could not delete file ${photo.filename}:`, err);
      });
      await photoModel.deletePhoto(photo.photo_id);
    }

    // Delete the listing
    await listingModel.deleteById(listingId);
    return res.status(200).json({ message: 'Listing deleted successfully.', listing_id: listingId });

  } catch (err) {
    console.error('[deleteListing]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

async function updateListing(req, res) {
  const { seller_id, listing_id, title, tags, condition, price, description, location, status } = req.body;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const allowedStatuses = ['Active', 'Sold', 'Pending', 'Draft'];
  const finalStatus = allowedStatuses.includes(status) ? status : 'Active';

  try {
    await listingModel.updateListing(listing_id, title, tags, condition, price, description, location, finalStatus);
    return res.status(200).json({ message: 'Listing updated', status: finalStatus });
  } catch (err) {
    console.error('[updateListing]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

module.exports = { 
  viewListing, search, idSearch, createListing, updateStatus, 
  deleteListing, updateListing }
