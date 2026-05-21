const fs         = require('fs');
const path       = require('path');
const photoModel = require('../model/photoModel');
const { resourceLimits } = require('worker_threads');

// Upload a photo
async function uploadPhoto  (req, res) {
  const { seller_id, listing_id } = req.body;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  // Check a file was actually uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  if (!seller_id || !listing_id) {
    return res.status(400).json({ error: 'seller_id and listing_id are required.' });
  }

  try {
    const filename  = req.file.filename;
    const file_path = `uploads/images/${filename}`;

    await photoModel.savePhoto(seller_id, listing_id, filename, file_path);

    

    return res.status(201).json({
      message:   'Photo uploaded successfully.',
      filename,
      file_path,
      url: `${req.protocol}://${req.get('host')}/${file_path}`,
    });

  } catch (err) {
    console.error('[uploadPhoto]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all photos for a listing
async function getPhotosByListing (req, res) {
  const listingId = parseInt(req.params.listing_id, 10);

  if (isNaN(listingId)) {
    return res.status(400).json({ error: 'Invalid listing ID.' });
  }

  try {
    const photos = await photoModel.getPhotosByListing(listingId);

    if (photos.length === 0) {
      return res.status(404).json({ error: 'No photos found for this listing.' });
    }

    return res.status(200).json({ photos });

  } catch (err) {
    console.error('[getPhotosByListing]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};


// Delete a single photo by photo_id
// DELETE /api/photos/:photo_id
async function deletePhoto (req, res) {
  const photoId = parseInt(req.params.photo_id, 10);
  const userId  = req.session.userId;
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
}

  if (!userId) {
    return res.status(401).json({ error: 'You must be logged in to delete a photo.' });
  }

  if (isNaN(photoId)) {
    return res.status(400).json({ error: 'Invalid photo ID.' });
  }

  try {
    const photo = await photoModel.getPhotoById(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    // Only the seller who uploaded it can delete it
    if (parseInt(photo.seller_id, 10) !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this photo.' });
    }

    // Remove the file from disk
    const filePath = path.join(__dirname, '..', 'views', 'uploads', photo.filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error('[deletePhoto] file unlink error:', err);
    });

    // Remove the record from the database
    await photoModel.deletePhoto(photoId);

    return res.status(200).json({ message: 'Photo deleted successfully.' });

  } catch (err) {
    console.error('[deletePhoto]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
    
  }
};



module.exports = { uploadPhoto, getPhotosByListing, deletePhoto };