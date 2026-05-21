const pool = require('../database/database.js');

// Save a photo record to the database
async function savePhoto (user_id, listing_id, filename, file_path) {
  const [result] = await pool.query(
    `INSERT INTO photos (seller_id, listing_id, filename, image_file_path)
     VALUES (?, ?, ?, ?)`,
    [user_id, listing_id, filename, file_path]
  );
  return result;
};

// Get all photos for a specific listing
async function getPhotosByListing (listing_id) {
  const [rows] = await pool.query(
    `SELECT photo_id, seller_id, listing_id, filename, image_file_path
     FROM photos
     WHERE listing_id = ?`,
    [listing_id]
  );
  return rows;
};


// Get a single photo by photo_id (used to verify ownership before deleting)
async function getPhotoById (photo_id) {
  const [rows] = await pool.query(
    `SELECT photo_id, seller_id, listing_id, filename, image_file_path
     FROM photos
     WHERE photo_id = ?`,
    [photo_id]
  );
  return rows[0] || null;
};

// Delete a photo record from the database
async function deletePhoto (photo_id) {
  const [result] = await pool.query(
    `DELETE FROM photos WHERE photo_id = ?`,
    [photo_id]
  );
  return result;
};


module.exports = { savePhoto, getPhotosByListing, getPhotoById, deletePhoto };